import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WifiHigh, WifiSlash, Plugs, CloudArrowDown, CloudArrowUp, CheckCircle, XCircle, Warning, Trash } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ConnectionSettings {
    protocol: 'artnet' | 'sacn' | 'usb'
    ipAddress: string
    port: number
    universe: number
    autoConnect: boolean
    sendRate: number
}

interface ConnectionProfile {
    id: string
    name: string
    settings: ConnectionSettings
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
    const [connectionProfiles, setConnectionProfiles] = useKV<ConnectionProfile[]>(
        'dmx-connection-profiles',
        []
    )
    const [isConnected, setIsConnected] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
    const [editIp, setEditIp] = useState(connectionSettings?.ipAddress || '192.168.1.100')
    const [editPort, setEditPort] = useState(connectionSettings?.port?.toString() || '6454')
    const [editUniverse, setEditUniverse] = useState(connectionSettings?.universe?.toString() || '0')
    const [profileName, setProfileName] = useState('')
    const [packetsSent, setPacketsSent] = useState(0)

    useEffect(() => {
        if (isConnected) {
            const interval = setInterval(() => {
                setPacketsSent(prev => prev + (connectionSettings?.sendRate || 40))
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [isConnected, connectionSettings?.sendRate])

    const handleConnect = () => {
        if (!connectionSettings) return

        if (isConnected) {
            setConnectionStatus('disconnected')
            setIsConnected(false)
            setPacketsSent(0)
            toast.info('Disconnected from DMX network')
        } else {
            setConnectionStatus('connecting')
            setTimeout(() => {
                setConnectionStatus('connected')
                setIsConnected(true)
                toast.success(`Connected via ${connectionSettings.protocol.toUpperCase()}`)
            }, 500)
        }
    }

    const handleQuickConnect = (profile: ConnectionProfile) => {
        setConnectionSettings(() => profile.settings)
        setEditIp(profile.settings.ipAddress)
        setEditPort(profile.settings.port.toString())
        setEditUniverse(profile.settings.universe.toString())
        toast.success(`Loaded profile "${profile.name}"`)
    }

    const handleSaveProfile = () => {
        if (!profileName.trim()) {
            toast.error('Enter profile name')
            return
        }

        const newProfile: ConnectionProfile = {
            id: Date.now().toString(),
            name: profileName.trim(),
            settings: connectionSettings!,
        }

        setConnectionProfiles((current) => [...(current || []), newProfile])
        setProfileName('')
        toast.success(`Profile "${newProfile.name}" saved`)
    }

    const handleDeleteProfile = (profileId: string) => {
        const profile = connectionProfiles?.find(p => p.id === profileId)
        setConnectionProfiles((current) => (current || []).filter(p => p.id !== profileId))
        if (profile) {
            toast.success(`Profile "${profile.name}" deleted`)
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

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <CheckCircle size={24} weight="fill" className="text-accent" />
            case 'connecting':
                return <WifiHigh size={24} className="text-primary animate-pulse" />
            case 'error':
                return <XCircle size={24} weight="fill" className="text-destructive" />
            default:
                return <WifiSlash size={24} className="text-muted-foreground" />
        }
    }

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'Connected'
            case 'connecting':
                return 'Connecting...'
            case 'error':
                return 'Connection Error'
            default:
                return 'Disconnected'
        }
    }

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'bg-accent'
            case 'connecting':
                return 'bg-primary'
            case 'error':
                return 'bg-destructive'
            default:
                return 'bg-muted'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Connection</h2>
                <p className="text-sm text-muted-foreground">Configure and manage DMX connections</p>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full ${getStatusColor()}/20 p-3`}>
                                {getStatusIcon()}
                            </div>
                            <div>
                                <h3 className="font-semibold">{getStatusText()}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isConnected
                                        ? `${connectionSettings?.protocol.toUpperCase()} - ${connectionSettings?.ipAddress}:${connectionSettings?.port}`
                                        : 'Not connected to DMX network'}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={isConnected ? 'default' : 'outline'}
                            className={isConnected ? getStatusColor() : ''}
                        >
                            {isConnected ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>

                    <Button 
                        onClick={handleConnect} 
                        className="w-full gap-2" 
                        size="lg"
                        disabled={connectionStatus === 'connecting'}
                    >
                        <Plugs weight="bold" />
                        {connectionStatus === 'connecting' ? 'Connecting...' : (isConnected ? 'Disconnect' : 'Connect')}
                    </Button>

                    {isConnected && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-muted p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <CloudArrowUp size={14} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Packets</span>
                                </div>
                                <p className="text-xl font-bold">{packetsSent.toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <CloudArrowDown size={14} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Rate</span>
                                </div>
                                <p className="text-xl font-bold">{connectionSettings?.sendRate || 40}Hz</p>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle size={14} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Channels</span>
                                </div>
                                <p className="text-xl font-bold">512</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="profiles">Profiles</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4 mt-4">
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
                                    <Label htmlFor="send-rate">Send Rate: {connectionSettings?.sendRate || 40}Hz</Label>
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
                                        className="w-full cursor-pointer"
                                    />
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
                                    variant="default"
                                    className="w-full gap-2"
                                >
                                    <CloudArrowUp weight="bold" />
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="profiles" className="space-y-4 mt-4">
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-1">Connection Profiles</h3>
                                <p className="text-sm text-muted-foreground">
                                    Save and load connection presets
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profile-name">Save Current as Profile</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="profile-name"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="e.g., Venue A, Home Setup"
                                    />
                                    <Button onClick={handleSaveProfile} disabled={!profileName.trim()}>
                                        Save
                                    </Button>
                                </div>
                            </div>

                            {(connectionProfiles || []).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No saved profiles yet
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Saved Profiles</Label>
                                    {(connectionProfiles || []).map((profile) => (
                                        <div
                                            key={profile.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{profile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {profile.settings.protocol.toUpperCase()} - {profile.settings.ipAddress}:{profile.settings.port}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuickConnect(profile)}
                                                >
                                                    Load
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteProfile(profile.id)}
                                                >
                                                    <Trash size={16} className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
