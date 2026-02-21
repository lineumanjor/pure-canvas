import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
}

const JitsiMeet = ({ roomName, displayName, onClose }: JitsiMeetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domain = "meet.jit.si";
    const options = {
      roomName,
      parentNode: containerRef.current,
      userInfo: { displayName },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "desktop", "chat",
          "raisehand", "videoquality", "fullscreen",
          "hangup",
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
      },
      width: "100%",
      height: "100%",
    };

    let api: any = null;

    const loadJitsi = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        api = new (window as any).JitsiMeetExternalAPI(domain, options);
        api.addEventListener("readyToClose", onClose);
      }
    };

    if (!(window as any).JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = loadJitsi;
      document.head.appendChild(script);
    } else {
      loadJitsi();
    }

    return () => {
      api?.dispose();
    };
  }, [roomName, displayName, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
      <div className="flex items-center justify-between p-3 bg-background/90 backdrop-blur">
        <span className="text-sm font-medium text-foreground">
          Videoconferência Essenza
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
};

export default JitsiMeet;
