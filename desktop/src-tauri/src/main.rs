#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    api::process::{Command, CommandEvent},
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
};

fn spawn_backend(app_handle: tauri::AppHandle) {
    if let Ok(mut command) = Command::new_sidecar("dmx-backend") {
        tauri::async_runtime::spawn(async move {
            let (mut rx, _child) = match command.spawn() {
                Ok(child) => child,
                Err(err) => {
                    eprintln!("failed to spawn backend sidecar: {err}");
                    return;
                }
            };
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
        eprintln!("dmx-backend sidecar not found. Build it via scripts\\build-server-exe.bat");
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
    SystemTray::new().with_menu(SystemTrayMenu::new().add_item(open).add_item(onboarding).add_item(restart).add_item(quit))
}
