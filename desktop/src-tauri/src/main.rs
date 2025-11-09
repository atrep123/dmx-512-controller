#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

use reqwest::Client;
use tauri::{
    api::{
        dialog,
        notification::Notification,
        process::{Command, CommandEvent},
    },
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
};

const BACKEND_HEALTH_URL: &str = "http://127.0.0.1:8080/healthz";
const BACKEND_MAX_ATTEMPTS: u32 = 60;
const BACKEND_POLL_INTERVAL_MS: u64 = 500;

fn spawn_backend(app_handle: tauri::AppHandle) {
    set_tray_status(&app_handle, "Desktop backend se spouští...");
    if let Ok(mut command) = Command::new_sidecar("dmx-backend") {
        tauri::async_runtime::spawn(async move {
            let (mut rx, _child) = match command.spawn() {
                Ok(child) => child,
                Err(err) => {
                    notify_backend_spawn_error(&app_handle, format!("Failed to spawn dmx-backend: {err}"));
                    return;
                }
            };

            let readiness_handle = app_handle.clone();
            tauri::async_runtime::spawn(wait_for_backend_ready(readiness_handle));

            let window = app_handle.get_window("main");
            while let Some(event) = rx.recv().await {
                if let CommandEvent::Stdout(line) | CommandEvent::Stderr(line) = event {
                    if let Some(win) = window.as_ref() {
                        let _ = win.emit("dmx-backend://log", line.clone());
                    }
                    println!("[dmx-backend] {line}");
                }
            }
        });
    } else {
        notify_backend_spawn_error(
            &app_handle,
            "dmx-backend sidecar not found. Build it via scripts\\build-server-exe.bat".to_string(),
        );
    }
}

fn notify_backend_spawn_error(app_handle: &tauri::AppHandle, message: String) {
    eprintln!("{message}");
    let window = app_handle
        .get_window("main")
        .or_else(|| app_handle.get_window("splash"));
    dialog::message(window.as_ref(), "Failed to start backend", message.clone());
    let _ = app_handle.emit_all("desktop://backend/error", message.clone());
    set_tray_status(app_handle, "Desktop backend selhal");
    show_tray_notification(app_handle, "Desktop backend selhal", &message);
}

async fn wait_for_backend_ready(app_handle: tauri::AppHandle) {
    let client = Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .expect("create backend readiness client");

    for attempt in 1..=BACKEND_MAX_ATTEMPTS {
        match client.get(BACKEND_HEALTH_URL).send().await {
            Ok(resp) if resp.status().is_success() => {
                show_main_window(&app_handle);
                let _ = app_handle.emit_all("desktop://backend/ready", attempt);
                set_tray_status(&app_handle, "Desktop backend běží");
                show_tray_notification(&app_handle, "Desktop backend připraven", "Backend běží a je připraven.");
                return;
            }
            _ => {
                let _ = app_handle.emit_all("desktop://backend/waiting", attempt);
                tauri::async_runtime::sleep(Duration::from_millis(BACKEND_POLL_INTERVAL_MS)).await;
            }
        }
    }

    let message = format!(
        "Backend did not respond on {}.\nCheck dmx-backend logs or restart the desktop app.",
        BACKEND_HEALTH_URL
    );
    let window = app_handle
        .get_window("main")
        .or_else(|| app_handle.get_window("splash"));
    dialog::message(window.as_ref(), "Backend startup failed", message.clone());
    let _ = app_handle.emit_all("desktop://backend/error", message.clone());
    set_tray_status(&app_handle, "Desktop backend selhal");
    show_tray_notification(&app_handle, "Desktop backend selhal", &message);
}

fn show_main_window(app_handle: &tauri::AppHandle) {
    if let Some(splash) = app_handle.get_window("splash") {
        let _ = splash.close();
    }
    if let Some(main) = app_handle.get_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .setup(|app| {
            spawn_backend(app.handle());
            Ok(())
        })
        .system_tray(build_tray())
        .on_system_tray_event(|app, event| {
            if let SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    "open" => {
                        if let Some(window) = app.get_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "restart-backend" => {
                        spawn_backend(app.app_handle());
                    }
                    "run-onboarding" => {
                        if let Some(window) = app.get_window("main") {
                            let _ = window.emit("desktop://onboarding/reset", ());
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running DMX desktop shell");
}

fn build_tray() -> SystemTray {
    let open = CustomMenuItem::new("open".to_string(), "Open");
    let onboarding = CustomMenuItem::new("run-onboarding".to_string(), "Run Onboarding");
    let restart = CustomMenuItem::new("restart-backend".to_string(), "Restart Backend");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    SystemTray::new()
        .with_menu(SystemTrayMenu::new().add_item(open).add_item(onboarding).add_item(restart).add_item(quit))
}

fn set_tray_status(app_handle: &tauri::AppHandle, message: &str) {
    if let Ok(tray) = app_handle.tray_handle() {
        let _ = tray.set_tooltip(message);
    }
}

fn show_tray_notification(app_handle: &tauri::AppHandle, title: &str, body: &str) {
    let identifier = app_handle.config().tauri.bundle.identifier.clone();
    let _ = Notification::new(identifier).title(title).body(body).show();
}
