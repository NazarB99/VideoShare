import { View, Image, Text, TouchableOpacity, Alert } from "react-native";
import React, { useMemo, useState } from "react";
import { Models } from "react-native-appwrite";
import { icons } from "@/constants";
import { Video } from "expo-av";
import { useGlobalContext } from "@/context/GlobalProvider";
import { bookmarkVideo } from "@/lib/appwrite";

interface VideoCardProps {
  video: Models.Document;
}

const VideoCard = ({ video: videoPost }: VideoCardProps) => {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [post, setPost] = useState(videoPost);

  const {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
    bookmark,
  } = post;

  const isBookmarked = useMemo(
    () => bookmark.some((item: Models.Document) => item.$id === user?.$id),
    [user, bookmark]
  );

  const handleBookmarkPress = async () => {
    try {
      if (user?.$id) {
        const updatedPost = await bookmarkVideo(
          videoPost,
          user.$id,
          isBookmarked
        );

        setPost(updatedPost);
      }
    } catch (error) {
      Alert.alert(String(error));
    }
  };

  return (
    <View className="items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center ml-3 flex-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-gray-100 text-xs font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        <TouchableOpacity className="pt-3" onPress={handleBookmarkPress}>
          <Image
            source={isBookmarked ? icons.heart : icons.heartOutline}
            className="w-5 h-5"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              if (status.didJustFinish) {
                setPlay(false);
              }
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
