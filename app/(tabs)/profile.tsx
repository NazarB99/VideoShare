import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyListState from "@/components/EmptyListState";
import SearchInput from "@/components/SearchInput";
import VideoCard from "@/components/VideoCard";
import { icons, images } from "@/constants";
import { getUserVideos, signOut } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import { Models } from "react-native-appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import InfoBox from "@/components/InfoBox";
import { router } from "expo-router";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(() =>
    getUserVideos(String(user?.$id))
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRenderItem = ({ item }: { item: Models.Document }) => {
    return <VideoCard video={item} />;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);
      router.replace("/sign-in");
    } catch (error) {
      Alert.alert(String(error));
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        renderItem={handleRenderItem}
        ListHeaderComponent={
          user && (
            <ListHeader user={user} posts={posts} onLogout={handleLogout} />
          )
        }
        ListEmptyComponent={
          <EmptyListState
            title="No videos found"
            subtitle="No videos created yet"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const ListHeader = ({
  user,
  posts,
  onLogout,
}: {
  user: Models.Document;
  posts: Models.Document[];
  onLogout: () => void;
}) => {
  return (
    <View className="w-full justify-center items-center mt-6 mb-12 px-4">
      <TouchableOpacity onPress={onLogout} className="w-full items-end mb-10">
        <Image source={icons.logout} className="w-6 h-6" resizeMode="contain" />
      </TouchableOpacity>

      <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
        <Image
          source={{ uri: user?.avatar }}
          className="w-[90%] h-[90%] rounded-lg"
          resizeMode="cover"
        />
      </View>

      <InfoBox
        title={String(user?.username)}
        containerStyles="mt-5"
        titleStyles="text-lg"
      />

      <View className="mt-5 flex-row">
        <InfoBox
          title={String(posts.length)}
          subtitle="Posts"
          containerStyles="mr-10"
          titleStyles="text-xl"
        />
        <InfoBox title="1.2k" subtitle="Followers" titleStyles="text-xl" />
      </View>
    </View>
  );
};

export default Profile;
