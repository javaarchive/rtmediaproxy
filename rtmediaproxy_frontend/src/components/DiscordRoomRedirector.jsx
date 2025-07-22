import { useEffect, useState } from "react";
import { apiPath, checkChannelRoomAssociation } from "../utils";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { init } from "astro/virtual-modules/prefetch.js";

export function DiscordRoomRedirector(props) {

    const [statusText, setStatusText] = useState("Hold tight while we connect with Discord...");
    const [debugInfo, setDebugInfo] = useState("");

    useEffect(() => {
        (async () => {
            // this codepath doesn't work because we can't ready this late in  an activty so just use the lite mode only.
            try{

                setDebugInfo(`Cur params: ${JSON.stringify(location.search)} raw: ${location.search}`);

                const response = await fetch(apiPath("/api/discord/init"));
                if(!response.ok) {
                    setStatusText("Discord integration failed to initialize. It may not be supported on this server.");
                }
                const initData = await response.json();
                setStatusText("Initializing SDK...");
                console.log("init data", initData);
                const discordSdk = new DiscordSDK(initData.clientID, {
                    disableConsoleLogOverride: true
                });
                console.log("sdk", discordSdk);
                window.discordSdk = discordSdk;
                setStatusText("Waiting for SDK to be ready...");
                await discordSdk.ready();
                setStatusText("Discord SDK is ready. Getting auth");
                console.log("channel preauth", discordSdk.channelId, discordSdk.instanceId);
                const auth = await discordSdk.commands.authorize({
                    client_id: initData.clientID,
                    response_type: "code",
                    state: "",
                    prompt: "none",
                    scope: [
                        "identify",
                        "guilds"
                    ],
                });

                const tokenResponse = await fetch(apiPath("/api/discord/token"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: auth.code
                    })
                });
                if(!tokenResponse.ok) {
                    setStatusText("Discord token request failed with status code " + tokenResponse.status);
                    return;
                }
                const tokenResponseJson = await tokenResponse.json();
                if(!tokenResponseJson.ok) {
                    setStatusText("Discord token request failed with status code " + tokenResponseJson.status);
                    return;
                }

                setStatusText("Authenticating with Discord...");

                await discordSdk.commands.authenticate({
                    access_token: tokenResponseJson.token,
                });

                // TODO: fetch more info in future with this
                setStatusText("Detecting room...");
                await checkChannelRoomAssociation(discordSdk.channelId, true, false);

            }catch(ex){
                console.warn(ex);
                setStatusText("ERROR: trying to setup Discord Integration. Try again perhaps?");
                return;
            }
            
            

        })();
    }, [])

    return <div className="discord-integration">
        <p>
            {statusText}
        </p>
        <pre>
            {debugInfo}
        </pre>
    </div>
}


export default DiscordRoomRedirector;