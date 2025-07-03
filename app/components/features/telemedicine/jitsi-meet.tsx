"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings, 
  Users,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { VirtualMeetingInfo } from '@/app/types';

interface JitsiMeetComponentProps {
  meetingInfo: VirtualMeetingInfo;
  roomName: string;
  displayName: string;
  email?: string;
  onMeetingEnd?: () => void;
  onError?: (error: string) => void;
}

interface JitsiAPI {
  dispose: () => void;
  executeCommand: (command: string, ...args: any[]) => void;
  executeCommands: (commands: { [key: string]: any }) => void;
  getAvailableDevices: () => Promise<any>;
  getCurrentDevices: () => Promise<any>;
  isDeviceListAvailable: () => boolean;
  isDeviceChangeAvailable: (deviceType: string) => boolean;
  isMultipleAudioInputsSupported: () => boolean;
  addListener: (event: string, listener: (...args: any[]) => void) => void;
  removeListener: (event: string, listener: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JitsiMeetComponent: React.FC<JitsiMeetComponentProps> = ({
  meetingInfo,
  roomName,
  displayName,
  email,
  onMeetingEnd,
  onError
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<JitsiAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [meetingStarted, setMeetingStarted] = useState(false);

  useEffect(() => {
    if (!jitsiContainerRef.current) return;

    // Load Jitsi Meet External API script
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();

        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName,
            email: email
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableUserRolesBasedOnToken: false,
            enableFeaturesBasedOnToken: false,
            requireDisplayName: true,
            disableThirdPartyRequests: true,
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            enableTalkWhileMuted: false,
            enableClosePage: false,
            toolbarButtons: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'security'
            ]
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_FOOTER: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            DISABLE_PRESENCE_STATUS: false,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
            DISABLE_FOCUS_INDICATOR: false,
            DISABLE_LOCAL_VIDEO_FLIP: false,
            DISABLE_PRIVATE_MESSAGES: false,
            DISABLE_PROFILE: false,
            DISABLE_REMOTE_MUTE: false,
            DISABLE_RINGING: false,
            DISABLE_TRANSCRIPTION_SUBTITLES: false,
            DISABLE_VIDEO_BACKGROUND: false,
            ENABLE_DIAL_OUT: false,
            ENABLE_FEEDBACK_ANIMATION: false,
            FILM_STRIP_MAX_HEIGHT: 120,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            HIDE_DEEP_LINKING_LOGO: false,
            JITSI_WATERMARK_LINK: '',
            LANG_DETECTION: true,
            LIVE_STREAMING_HELP_LINK: '',
            LOCAL_THUMBNAIL_RATIO: 16 / 9,
            MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
            OPTIMAL_BROWSERS: ['chrome', 'chromium', 'firefox', 'nwjs', 'electron', 'safari'],
            POLICY_LOGO: null,
            PROVIDER_NAME: 'HealthSphere',
            RECENT_LIST_ENABLED: false,
            REMOTE_THUMBNAIL_RATIO: 1,
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_ALWAYS_VISIBLE: false,
            TOOLBAR_TIMEOUT: 4000,
            UNSUPPORTED_BROWSERS: [],
            VIDEO_LAYOUT_FIT: 'both'
          }
        };

        const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
        setApi(jitsiApi);

        // Event listeners
        jitsiApi.addListener('videoConferenceJoined', (event: any) => {
          console.log('Conference joined:', event);
          setMeetingStarted(true);
          setIsLoading(false);
        });

        jitsiApi.addListener('videoConferenceLeft', (event: any) => {
          console.log('Conference left:', event);
          setMeetingStarted(false);
          onMeetingEnd?.();
        });

        jitsiApi.addListener('participantJoined', (event: any) => {
          console.log('Participant joined:', event);
          setParticipantCount(prev => prev + 1);
        });

        jitsiApi.addListener('participantLeft', (event: any) => {
          console.log('Participant left:', event);
          setParticipantCount(prev => Math.max(0, prev - 1));
        });

        jitsiApi.addListener('audioMuteStatusChanged', (event: any) => {
          setIsAudioEnabled(!event.muted);
        });

        jitsiApi.addListener('videoMuteStatusChanged', (event: any) => {
          setIsVideoEnabled(!event.muted);
        });

        jitsiApi.addListener('screenSharingStatusChanged', (event: any) => {
          setIsScreenSharing(event.on);
        });

        jitsiApi.addListener('readyToClose', () => {
          onMeetingEnd?.();
        });

        jitsiApi.addListener('errorOccurred', (event: any) => {
          console.error('Jitsi error:', event);
          onError?.(event.error?.message || 'An error occurred during the meeting');
        });

        // Auto-join after a short delay
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);

      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        setIsLoading(false);
        onError?.('Failed to initialize video call');
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [roomName, displayName, email, onMeetingEnd, onError]);

  const toggleVideo = () => {
    if (api) {
      api.executeCommand('toggleVideo');
    }
  };

  const toggleAudio = () => {
    if (api) {
      api.executeCommand('toggleAudio');
    }
  };

  const toggleScreenShare = () => {
    if (api) {
      api.executeCommand('toggleShareScreen');
    }
  };

  const hangUp = () => {
    if (api) {
      api.executeCommand('hangup');
    }
  };

  const openChat = () => {
    if (api) {
      api.executeCommand('toggleChat');
    }
  };

  const toggleSettings = () => {
    if (api) {
      api.executeCommand('toggleSettings');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full min-h-[600px] flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Connecting to Virtual Consultation
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Please wait while we set up your secure video call...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black dark:bg-zinc-950 rounded-lg overflow-hidden">
      {/* Meeting Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            LIVE
          </Badge>
          {participantCount > 0 && (
            <Badge 
              variant="outline" 
              className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
            >
              <Users className="w-3 h-3 mr-1" />
              {participantCount + 1}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
          HealthSphere Virtual Consultation
        </div>
      </div>

      {/* Jitsi Container */}
      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full min-h-[600px]"
      />

      {/* Custom Control Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-2 bg-black bg-opacity-80 rounded-full px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            className={`rounded-full w-10 h-10 p-0 ${
              isAudioEnabled 
                ? 'text-white hover:bg-white hover:bg-opacity-20' 
                : 'text-red-500 bg-red-500 bg-opacity-20 hover:bg-red-500 hover:bg-opacity-30'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVideo}
            className={`rounded-full w-10 h-10 p-0 ${
              isVideoEnabled 
                ? 'text-white hover:bg-white hover:bg-opacity-20' 
                : 'text-red-500 bg-red-500 bg-opacity-20 hover:bg-red-500 hover:bg-opacity-30'
            }`}
          >
            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleScreenShare}
            className={`rounded-full w-10 h-10 p-0 ${
              isScreenSharing 
                ? 'text-green-500 bg-green-500 bg-opacity-20' 
                : 'text-white hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <Share2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={openChat}
            className="rounded-full w-10 h-10 p-0 text-white hover:bg-white hover:bg-opacity-20"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSettings}
            className="rounded-full w-10 h-10 p-0 text-white hover:bg-white hover:bg-opacity-20"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white bg-opacity-20 mx-2" />

          <Button
            variant="destructive"
            size="sm"
            onClick={hangUp}
            className="rounded-full w-10 h-10 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JitsiMeetComponent;
