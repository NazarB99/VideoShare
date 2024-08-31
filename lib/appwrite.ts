import { FormType } from "@/app/(tabs)/create";
import { DocumentPickerAsset } from "expo-document-picker";
import { ImagePickerAsset } from "expo-image-picker";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Models,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.videoshare",
  projectId: "66c9a66e000e25147d23",
  databaseId: "66c9abf800204c4e2e48",
  usersCollectionId: "66c9ac430002b575faa4",
  videosCollectionId: "66c9ac78002017a4acf8",
  storageId: "66c9ae3700234d84b4c1",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  usersCollectionId,
  videosCollectionId,
  storageId,
} = appwriteConfig;

const client = new Client();

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error("Account not found");

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = databases.createDocument(
      databaseId,
      usersCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    if (!session) throw new Error();

    const user = await getCurrentUser();

    return user;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error();

    const currentUser = await databases.listDocuments(
      databaseId,
      usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw new Error();

    return currentUser.documents[0];
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getAllVideos = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getLatestVideos = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getUserBookmarkedVideos = async (userId: string) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    // Filter the results to ensure we only get exact matches
    const filteredPosts = posts.documents.filter((post) =>
      post.bookmark.some((user: Models.Document) => user.$id === userId)
    );

    console.log('filteredPosts', filteredPosts);

    return filteredPosts;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const searchVideo = async (query: string) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.search("title", query)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getUserVideos = async (userId: string) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const signOut = async () => {
  try {
    const res = account.deleteSession("current");

    return res;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getFilePreview = async (
  fileId: string,
  type: "image" | "video"
) => {
  let fileUrl;

  try {
    if (type === "image") {
      fileUrl = await storage.getFilePreview(
        storageId,
        fileId,
        1000,
        1000,
        ImageGravity.Top,
        70
      );
    } else if (type === "video") {
      fileUrl = await storage.getFileView(storageId, fileId);
    } else {
      throw new Error("Invalid file type");
    }

    return fileUrl;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const uploadFile = async (
  file: ImagePickerAsset | null,
  type: "image" | "video"
) => {
  if (!file) return;

  const { mimeType, fileSize, fileName, uri } = file;
  const asset = {
    type: mimeType ?? "",
    size: fileSize ?? 0,
    name: fileName ?? "",
    uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const createVideo = async (form: FormType) => {
  try {
    const [imageUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videosCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: imageUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const bookmarkVideo = async (
  videoPost: Models.Document,
  userId: string,
  isDelete: boolean
) => {
  const { title, thumbnail, video, prompt, creator, bookmark } = videoPost;
  try {
    const updatedPost = await databases.updateDocument(
      databaseId,
      videosCollectionId,
      videoPost.$id,
      {
        title,
        thumbnail,
        video,
        prompt,
        creator,
        bookmark: isDelete
          ? bookmark.filter((item: Models.Document) => item.$id !== userId)
          : [...bookmark, userId],
      }
    );

    return updatedPost;
  } catch (error) {
    throw new Error(String(error));
  }
};
