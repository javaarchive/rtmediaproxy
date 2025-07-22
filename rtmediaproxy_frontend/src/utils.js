// https://github.com/javaarchive/togetherfin/blob/66a51d5d4f968a1997a06ce0e65549ff3383a6da/togetherfin-app/app/lib/utils.ts#L8
export function detectDiscordActivity() {
  if(typeof location != "undefined" && typeof location.hostname != "undefined"){
    if(location.hostname.endsWith(".discordsays.com")){
      return true;
    }
  }
  return false;
}

/**
 * Reformat paths for the specific platform.
 * @export
 * @param {string} path
 * @return {string} 
 */
export function apiPath(path) {
  return detectDiscordActivity() ? "/.proxy" + path : path;
}

export async function checkChannelRoomAssociation(channelID, redirect = true, liteOnly = false) {
  const response = await fetch(apiPath("/api/channel/" + channelID));
  try{
    if(response.ok){
      const channelData = await response.json();
      if(channelData.room && channelData.room.roomId){
        if(redirect) {
          if(!liteOnly || channelData.lite) {

            // add fullscreen=1 to the current url
            const url = new URL(location.href);
            url.searchParams.set("fullscreen", "1");

            location.href = `/room/${encodeURIComponent(channelData.room.roomId)}${url.search}`;
            return channelData.room.roomId;
          } else {
            return channelData.room.roomId;
          }
        }else{
          return channelData.room.roomId;
        }
      }
    }
  }catch(ex){
    return false;
  }
  return false;
}

export function acquireWebRTC(){
  const currentWebRTC = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  if(!currentWebRTC){
    // attempt bypass
    // for discord activities specifically
    // I heard this working is intended behavior.
    const ifr = document.createElement("iframe");
    ifr.src="about:blank";
    ifr.style.display = "none";
    document.body.appendChild(ifr);
    currentWebRTC = ifr.contentWindow.RTCPeerConnection || ifr.contentWindow.mozRTCPeerConnection || ifr.contentWindow.webkitRTCPeerConnection;
    document.body.removeChild(ifr);
  }
  if(!currentWebRTC){
    console.warn("all webrtc methods failed to acquire");
    throw new Error("Could not acquire WebRTC");
  }
  return currentWebRTC;
}