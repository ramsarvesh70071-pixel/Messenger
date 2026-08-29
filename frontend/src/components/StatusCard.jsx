import React from "react";
import StoryRing from "./StoryRing";
import {
    TouchableOpacity,
    View,
    Text,
} from "react-native";

export default function StatusCard({
    item,
    onPress,
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#333",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <StoryRing />

                <View
                    style={{
                        marginLeft: 12,
                    }}
                >
                    <Text
                        style={{
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: "700",
                        }}
                    >
                        {item.user?.name}
                    </Text>

                    <Text
                        style={{
                            color: "#bbb",
                        }}
                    >
                        {item.content}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}