import firebase from '../config/firebase';
const db = firebase.firestore();

export async function createChat(otherUser, history) {
  const user = firebase.auth().currentUser;

  let data = {
    lastMessage: '',
    lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
    particapate: [],
    chatUserIds: firebase.firestore.FieldValue.arrayUnion(user.uid, otherUser.id),
    chatUsers: firebase.firestore.FieldValue.arrayUnion(
      {
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL || null,
        isRead: false,
      },
      {
        id: otherUser.id,
        displayName: otherUser.displayName,
        photoURL: otherUser.photoURL || null,
        isRead: false,
      }
    ),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const chatDoc = db.collection('chat').where('chatUserIds', 'array-contains', otherUser.id);
    const chatDocRef = await chatDoc.get();

    const some = chatDocRef.docs.some((item) => item.data().chatUserIds.indexOf(user.uid) !== -1);
    const isLeave = chatDocRef.docs.findIndex((item) =>
      item.data().chatUsers.every((data) => data.id === otherUser.id || data.id === user.uid)
    );

    console.log('asd');

    if (!some && isLeave === -1) {
      const docRef = await db.collection('chat').add(data);
      return history.push(`/chat/${docRef.id}`);
    } else if (!some && isLeave !== -1) {
      await chatDocRef.docs[isLeave].ref.update({
        chatUserIds: firebase.firestore.FieldValue.arrayUnion(user.uid),
      });
      return history.push(`/chat/${chatDocRef.docs[isLeave].id}`);
    } else {
      history.push(`/chat/${chatDocRef.docs[0].id}`);
    }
  } catch (error) {
    throw error;
  }
}

export function getChatList() {
  const user = firebase.auth().currentUser;
  return db.collection('chat').where('chatUserIds', 'array-contains', user.uid).orderBy('lastMessageTime', 'desc');
}

export async function sendMessage(chatId, text) {
  const currentUser = firebase.auth().currentUser;
  const docRef = db.collection('chat').doc(chatId);

  try {
    const docRefData = await docRef.get();

    if (docRefData.data().chatUserIds.length === 1) {
      const anotherUser = docRefData.data().chatUsers.filter((user) => user.id !== currentUser.uid)[0];

      await docRef.update({
        chatUserIds: firebase.firestore.FieldValue.arrayUnion(anotherUser.id),
      });
    }

    function badgeCount(count) {
      if (docRefData.data().particapate.length === 2) {
        return count;
      }
      return count + 1;
    }

    await docRef.update({
      lastMessage: text,
      lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
      chatUsers: docRefData.data().chatUsers.map((user) => {
        if (user.id !== currentUser.uid) {
          return {
            ...user,
            isRead: badgeCount(user.isRead),
          };
        } else {
          return user;
        }
      }),
    });

    return firebase
      .database()
      .ref(`message/${chatId}`)
      .push({
        text,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        uid: currentUser.uid,
        photoURL: currentUser.photoURL || null,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
      });
  } catch (error) {
    throw error;
  }
}

export async function outChatList(chatId) {
  const currentUser = firebase.auth().currentUser;
  const docRef = db.collection('chat').doc(chatId);
  const rootRef = firebase.database().ref(`message`);

  try {
    const docRefData = await docRef.get();

    if (docRefData.data().chatUserIds.length === 2) {
      return await docRef.update({
        particapate: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        chatUserIds: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        chatUsers: docRefData.data().chatUsers.map((user) => (user.id === currentUser.uid ? { ...user, isRead: 0 } : user)),
      });
    } else {
      await db.collection('chat').doc(chatId).delete();
      return await rootRef.child(chatId).remove();
    }
  } catch (error) {
    throw error;
  }
}

export function getChatMessageList(chatId) {
  return firebase.database().ref(`message/${chatId}`).orderByKey();
}

export async function particapateChat(chatId, type, history) {
  const user = firebase.auth().currentUser;
  const chatDocRef = db.collection('chat').doc(chatId);
  const chatDocRefData = await chatDocRef.get();

  if (!chatDocRefData.exists) return history.push('/chat');
  if (chatDocRefData.data().chatUserIds.indexOf(user.uid) === -1) return history.push('/chat');

  if (type === 'participate') {
    return chatDocRef.update({
      particapate: firebase.firestore.FieldValue.arrayUnion(user.uid),
      chatUsers: chatDocRefData.data().chatUsers.map((anotherUser) => {
        if (anotherUser.id === user.uid) {
          return { ...anotherUser, isRead: 0 };
        }
        return anotherUser;
      }),
    });
  } else {
    return chatDocRef.update({
      particapate: firebase.firestore.FieldValue.arrayRemove(user.uid),
    });
  }
}

// ?????? ????????? ????????????
export async function realChatPhotoIconUpdate(root, photoData) {
  const userUid = firebase.auth().currentUser.uid;
  const chatRef = firebase.database().ref(root);

  try {
    const chatSnap = await chatRef.get();
    if (chatSnap.exists()) {
      const rootId = Object.entries(chatSnap.val()).map((evt) => evt[0]);

      if (rootId.length) {
        for (let val of rootId) {
          const childRef = chatRef.child(val);
          const data = await childRef.get();
          const key = Object.keys(data.val());

          for (let val of key) {
            const test = childRef.child(val);
            const data = await test.get();

            if (data.val().uid === userUid) {
              test.ref.update(photoData);
            }
          }
        }
      }
    }
  } catch (error) {
    throw error;
  }
}
