import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkChannelRoomAssociation, detectDiscordActivity } from "../utils";

export function DiscordMagicRedirect(props) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if(detectDiscordActivity()) {
            console.warn("Detected Discord activity, preparing to redirect");
            (async () => {
                // bypass SDK
                const channelID = (new URLSearchParams(location.search)).get("channel_id");
                if(channelID){
                    console.log("doing lite  check");
                    if(await checkChannelRoomAssociation(channelID, true, true, navigate)){
                        return;
                    }
                }
                console.log("redirecting to discord specific page");
                navigate(`/discord${location.search}`);
            })();
           
        }
    },  [navigate, location.search]);
    return <>
    </>;
}
