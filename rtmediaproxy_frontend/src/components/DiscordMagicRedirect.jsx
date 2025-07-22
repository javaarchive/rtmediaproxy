import { useEffect } from "react";
import { checkChannelRoomAssociation, detectDiscordActivity } from "../utils";

export function DiscordMagicRedirect(props) {
    useEffect(() => {
        if(detectDiscordActivity()) {
            console.warn("Detected Discord activity, preparing to redirect");
            (async () => {
                // bypass SDK
                const channelID = (new URLSearchParams(location.search)).get("channel_id");
                if(channelID){
                    console.log("doing lite  check");
                    if(await checkChannelRoomAssociation(channelID, true, true)){
                        return;
                    }
                }
                console.log("redirecting to discord specific page");
                location.href = `/discord${location.search}`;
            })();
           
        }
    },  []);
    return <>
    </>;
}