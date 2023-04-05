
import { ChatGPTAPIBrowser } from 'chatgpt'
import qrcode from "qrcode-terminal";

async function main() {
    const chatgpt = new ChatGPTAPIBrowser({
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
    })

    await chatgpt.initSession()

    client.on("message", (message) => {
        (async () => {
            console.log(
                `From: ${message._data.id.remote} (${message._data.notifyName})`
            );

            console.log(`Message: ${message.body}`);

            // If added to a chatgroup, only respond if tagged
            const chat = await message.getChat();

            if (
                chat.isGroup &&
                !message.mentionedIds.includes(whatsapp.info.wid._serialized)
            )
                return;

            // Do we already have a conversation for this sender, or is the user resetting this conversation?
            if (
                conversations[message._data.id.remote] === undefined ||
                message.body === "reset"
            ) {
                console.log(`Creating new conversation for ${message._data.id.remote}`);
                if (message.body === "reset") {

                    message.reply("Conversation reset");
                    return;
                }
                conversations[message._data.id.remote] = chatgpt;
            }

            const response = await conversations[message._data.id.remote].sendMessage(
                message.body
            );

            console.log(`Response: ${response.response}`);

            message.reply(response.response);
        })();
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

const sleep = (waitTimeInMs) =>
    new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
