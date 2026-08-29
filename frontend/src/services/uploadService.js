import axios from "axios";

const API =
    "http://YOUR_BACKEND_IP:5000/api/upload";

export const uploadImage =
    async (imageUri, token) => {

        const res =
            await axios.post(
                `${API}/image`,
                {
                    image: imageUri,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        return res.data.url;
    };