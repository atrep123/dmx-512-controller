import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WifiHigh, WifiSlash, Plugs, CloudArrowDown, CloudArrowUp } from '@phosphor-icons/react'
import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface ConnectionSettings {
    protocol: 'artnet' | 'sacn' | 'usb'
    ipAddress: string
    port: number
    universe: number
    autoConnect: boolean
    sendRate: number
}

export default function ConnectionView() {
    const [connectionSettings, setConnectionSettings] = useKV<ConnectionSettings>(
        'dmx-connection-settings',
        {
            protocol: 'artnet',
            ipAddress: '192.168.1.100',
            port: 6454,
            universe: 0,
            autoConnect: false,
            sendRate: 40,
        }
    )
    const [isConnected, setIsConnected] = useState(false)
    const [editIp, setEditIp] = useState(connectionSettings?.ipAddress || '192.168.1.100')
    const [editPort, setEditPort] = useState(
        connectionSettings?.port?.toString() || '6454'
    )
    const [editUniverse, setEditUniverse] = useState(
        connectionSettings?.universe?.toString() || '0'
    )

    const handleConnect = () => {
        if (!connectionSettings) return

        if (isConnected) {
            setIsConnected(false)
            toast.info('Disconnected from DMX network')
        } else {
            setIsConnected(true)
            toast.success(`Connected via ${connectionSettings.protocol.toUpperCase()}`)
        }
    }

    const handleSaveSettings = () => {
        const port = parseInt(editPort)
        const universe = parseInt(editUniverse)

        if (isNaN(port) || port < 1 || port > 65535) {
            toast.error('Port must be between 1 and 65535')
            return
        }

        if (isNaN(universe) || universe < 0 || universe > 32767) {
            toast.error('Universe must be between 0 and 32767')
            return
        }

        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
        if (!ipPattern.test(editIp)) {
            toast.error('Invalid IP address format')
            return
        }

        setConnectionSettings((current) => ({
            ...current!,
            ipAddress: editIp,
            port,
            universe,
        }))

        toast.success('Connection settings saved')
    }

    const handleProtocolChange = (protocol: ConnectionSettings['protocol']) => {
        setConnectionSettings((current) => {
            const newSettings = { ...current!, protocol }
            
            if (protocol === 'artnet') {
                newSettings.port = 6454
            } else if (protocol === 'sacn') {
                newSettings.port = 5568
            }
            
            setEditPort(newSettings.port.toString())
            return newSettings
        })
    }

    const handleSendRateChange = (rate: number) => {
        setConnectionSettings((current) => ({ ...current!, sendRate: rate }))
    }

    const handleAutoConnectChange = (enabled: boolean) => {
        setConnectionSettings((current) => ({ ...current!, autoConnect: enabled }))
    }

    const getProtocolDescription = (protocol: string) => {
        switch (protocol) {
            case 'artnet':
                return 'Art-Net protocol for Ethernet DMX'
            case 'sacn':
                return 'sACN (E1.31) streaming ACN protocol'
            case 'usb':
                return 'Direct USB DMX interface'
            default:
                return ''
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Connection</h2>
                <p className="text-sm text-muted-foreground">Configure DMX network settings</p>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isConnected ? (
                                <div className="rounded-full bg-accent/20 p-3">
                                    <WifiHigh size={24} className="text-accent" />
                                </div>
                            ) : (
                                <div className="rounded-full bg-muted p-3">
                                    <WifiSlash size={24} className="text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isConnected
                                        ? `${connectionSettings?.protocol.toUpperCase()} - ${
                                              connectionSettings?.ipAddress
                                          }:${connectionSettings?.port}`
                                        : 'Not connected to DMX network'}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={isConnected ? 'default' : 'outline'}
                            className={isConnected ? 'bg-accent' : ''}
                        >
                            {isConnected ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    <Button onClick={handleConnect} className="w-full gap-2" size="lg">
                        <Plugs weight="bold" />
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </Button>
                </div>
            </Card>

            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-1">Network Settings</h3>
                        <p className="text-sm text-muted-foreground">
                            Configure protocol and network parameters
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="protocol">Protocol</Label>
                            <Select
                                value={connectionSettings?.protocol}
                                onValueChange={handleProtocolChange}
                            >
                                <SelectTrigger id="protocol">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="artnet">Art-Net</SelectItem>
                                    <SelectItem value="sacn">sACN (E1.31)</SelectItem>
                                    <SelectItem value="usb">USB DMX</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {getProtocolDescription(connectionSettings?.protocol || 'artnet')}
                            </p>
                        </div>

                        {connectionSettings?.protocol !== 'usb' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="ip-address">IP Address</Label>
                                    <Input
                                        id="ip-address"
                                        value={editIp}
                                        onChange={(e) => setEditIp(e.target.value)}
                                        placeholder="192.168.1.100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="port">Port</Label>
                                        <Input
                                            id="port"
                                            type="number"
                                            value={editPort}
                                            onChange={(e) => setEditPort(e.target.value)}
                                            placeholder="6454"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="universe">Universe</Label>
                                        <Input
                                            id="universe"
                                            type="number"
                                            value={editUniverse}
                                            onChange={(e) => setEditUniverse(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="send-rate">Send Rate (Hz)</Label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="send-rate"
                                    type="range"
                                    min="20"
                                    max="60"
                                    step="5"
                                    value={connectionSettings?.sendRate || 40}
                                    onChange={(e) =>
                                        handleSendRateChange(parseInt(e.target.value))
                                    }
                                    className="flex-1 cursor-pointer"
                                />
                                <span className="font-mono text-sm w-12 text-right">
                                    {connectionSettings?.sendRate || 40}Hz
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Higher rates = smoother but more network traffic
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="auto-connect" className="cursor-pointer">
                                    Auto-connect on startup
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically connect when app opens
                                </p>
                            </div>
                            <Switch
                                id="auto-connect"
                                checked={connectionSettings?.autoConnect || false}
                                onCheckedChange={handleAutoConnectChange}
                            />
                        </div>

                        <Button
                            onClick={handleSaveSettings}
                            variant="outline"
                            className="w-full gap-2"
                        >
                            <CloudArrowUp weight="bold" />
                            Save Settings
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-1">Data Output</h3>
                        <p className="text-sm text-muted-foreground">DMX data transmission status</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-muted p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CloudArrowUp size={16} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Sent</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {isConnected ? '512' : '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">Channels</p>
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CloudArrowDown size={16} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Rate</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {isConnected ? connectionSettings?.sendRate || 40 : '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">Hz</p>
                        </div>
                    </div>

                    {isConnected && (
                        <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
                            <p className="text-sm text-accent-foreground flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                DMX data streaming active
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
