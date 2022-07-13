const lib = require("instagram-apis");
const fs = require("fs");
const axios = require("axios");
const client = new lib();
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    })}
(
    async () => {
        await client.init({
            username: "majhcc.test",
            password: "oman1234"
        })
        while (true) {
            await sleep(5000);
            const messages = await client.getChats()
            messages.threads.forEach(async (thread) => {
                thread.items.forEach(async (item) => {
                    if (!item.is_sent_by_viewer){
                        const logs = fs.readFileSync("./log.txt", "utf-8").replace(`\r`, ``).split("\n")
                        if (!logs.includes(item.item_id)){
                            fs.appendFileSync(`log.txt`, `${item.item_id}\n`)
                            try {
                                if (item.item_type === "text"){
                                    if (item.text == "/help"){
                                        client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Welcome to majhcc bot 🤖\n\n/help - show this message\n You can download any story by sending it. \n Join our channel in Telegram: https://t.me/majhc`}) 
                                    } 
                                
                                } else if (item.item_type === "link") {
                                    if (item.link.text.includes("tiktok")){
                                        // console.log(item)
                                        const tklink = item.link.link_context.link_url
                                        const { data } = await axios.get(`https://api-v1.majhcc.com/api/tk?url=${tklink}`)
                                        client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `${data.link}`})
                                    }
                                } else if (item.item_type === "story_share") {
                                    if (item.story_share.reason === 4) {
                                            await client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Sorry, but this story is not allowed.\nI'll send follow request to that account.`})
                                            const pattern = /This story is hidden because @(.*?) has a private account. Follow @(.*?) to see their posts, videos and stories./;
                                            const match = item.story_share.message.match(pattern);
                                            const userinfo = await client.getUsernameInfo(match[1])
                                            const userid = userinfo.id
                                            await client.followByUserId(`${userid}`)
                                            await client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Follow request sent to @${match[1]}`})
                                    } else {
                                        
                                        if (item.story_share.media.media_type === 1){
                                            client.sendPhotoToChat({url: `${item.story_share.media.image_versions2.candidates[0].url}`, thread_id: `${thread.thread_id}`})
                                            // console.log(item.story_share.media.image_versions2.candidates[0].url)
                                        } else if (item.story_share.media.media_type === 2){
                                            client.sendVideoToChat({url: `${item.story_share.media.video_versions[0].url}`, thread_id: `${thread.thread_id}`})
                                            // console.log(item.story_share.media.video_versions[0].url)
                                        } else {
                                            client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Sorry, I can't download this story. 😢 \n Please call @jha4 to report this issue.`})
                                        }
                                    }

                                } else if (item.item_type == "media_share") {
                                    if (item.media_share.media_type === 1){
                                        client.sendPhotoToChat({url: `${item.media_share.image_versions2.candidates[0].url}`, thread_id: `${thread.thread_id}`})
                                        // console.log(item.media_share.media.image_versions2.candidates[0].url)
                                    } else if (item.media_share.media_type === 2){
                                        client.sendVideoToChat({url: `${item.media_share.video_versions[0].url}`, thread_id: `${thread.thread_id}`})
                                        // console.log(item.media_share.media.video_versions[0].url)
                                    } else if (item.media_share.media_type === 8) {
                                        item.media_share.carousel_media.forEach(async (carousel) => {
                                            if (item.media_share.carousel_share_child_media_id === carousel.id){
                                                if (carousel.media_type === 1){
                                                    client.sendPhotoToChat({url: `${carousel.image_versions2.candidates[0].url}`, thread_id: `${thread.thread_id}`})
                                                    // console.log(item.media_share.carousel_media[0].image_versions2.candidates[0].url)
                                                } else if (carousel.media_type === 2){
                                                    client.sendVideoToChat({url: `${carousel.video_versions[0].url}`, thread_id: `${thread.thread_id}`})
                                                    // console.log(item.media_share.carousel_media[0].video_versions[0].url)
                                                } else {
                                                    client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Sorry, I can't download this story. 😢 \n Please call @jha4 to report this issue.`})
                                                }
                                            }
                                        })
                                    } else {
                                        client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Sorry, I can't download this story. 😢 \n Please call @jha4 to report this issue.`})
                                        // console.log(item)
                                    }
                                
                                } else if (item.item_type === "clip"){
                                    // console.log(item.clip.clip.video_versions[0].url)
                                    client.sendVideoToChat({url: `${item.clip.clip.video_versions[0].url}`, thread_id: `${thread.thread_id}`})
                                } else if (item.item_type === "felix_share"){
                                    // console.log(item.felix_share.video.video_versions)
                                    client.sendVideoToChat({url: `${item.felix_share.video.video_versions[0].url}`, thread_id: `${thread.thread_id}`})
                                } else {
                                    client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `Sorry, I can't download this story. 😢 \n Please call @jha4 to report this issue.`})
                                    console.log(item)
                                }
                        } catch (error) {
                            console.log(error)
                            client.sendMessageToUserIds({userIds: [`${thread.inviter.pk}`], message: `error error. 😢 \n Please call @jha4 to report this issue.`})
                        }
                        }
                    }
                })
            })
        }
    }
)();

