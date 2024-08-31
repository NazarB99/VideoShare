import {
  Image,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  ViewToken,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Animatable from "react-native-animatable";
import { Models } from "react-native-appwrite";
import { icons } from "@/constants";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";

interface TrendingListProps {
  posts: any[];
}

const zoomIn = {
  0: {
    scale: 0.8,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.8,
  },
};

const TrendingItem = ({
  activePost,
  item,
}: {
  activePost: string;
  item: Models.Document;
}) => {
  const [play, setPlay] = useState(false);

  return (
    <Animatable.View
      className="mr-5"
      // @ts-ignore
      animation={activePost === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video
          source={{ uri: item.video }}
          className="w-52 h-72 rounded-[35px] mt-3 bg-white/10"
          resizeMode={ResizeMode.COVER}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (status.isLoaded) {
              if (status.didJustFinish) {
                setPlay(false);
              }
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            resizeMode="cover"
            className="w-52 h-72 rounded-[35px] overflow-hidden shadow-lg shadow-black/40"
          />
          <Image
            source={icons.play}
            className="h-12 w-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const TrendingList = ({ posts }: TrendingListProps) => {
  const [activePost, setActivePost] = useState<string | null>(null);

  useEffect(() => {
    if (posts.length) {
      setActivePost(posts[1].$id);
    }
  }, [posts]);

  const handleViewableItemChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<Models.Document>[];
  }) => {
    if (viewableItems.length > 0) {
      setActivePost(viewableItems[0].key);
    }
  };

  const handleRenderItem = ({ item }: { item: Models.Document }) => {
    return (
      activePost && item && <TrendingItem activePost={activePost} item={item} />
    );
  };

  return (
    // @ts-ignore
    <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      keyExtractor={(item) => item.$id}
      data={posts}
      renderItem={handleRenderItem}
      onViewableItemsChanged={handleViewableItemChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
    />
  );
};

export default TrendingList;
