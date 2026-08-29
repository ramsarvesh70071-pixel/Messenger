import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://YOUR_BACKEND_IP:5000/api/status";

const getToken = async () => {
    return await AsyncStorage.getItem(
        "wa_access_token"
    );
  };

export const fetchStatuses =
    async () => {

        const token =
            await getToken();

        const res =
            await axios.get(
                API_URL,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        return res.data;
  };

export const createStatus = async (
    content,
    type = "text",
    mediaUrl = ""
) => {
    const token =
        await getToken();

    const res = await axios.post(
        API_URL,
        {
            content,
            type,
            mediaUrl,
        },
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    return res.data;
  };

export const viewStatus =
    async (statusId) => {

        const token =
            await getToken();

        await axios.put(
            `${API_URL}/view/${statusId}`,
            {},
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );
  };

export const deleteStatus = async (
    statusId
) => {
    const token = getToken();

    await axios.delete(
        `${API_URL}/${statusId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};