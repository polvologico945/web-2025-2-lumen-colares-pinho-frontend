export const storageKeys = {
  POSTS: 'lumen_posts',
  USER_POSTS: (userId) => `user_${userId}_posts`,
  USER_DATA: 'user',
  TOKEN: 'token'
};

// Salvar post
export const savePost = (post) => {
  try {
    const posts = getPosts();
    
    // Verificar se já existe
    const exists = posts.some(p => p.id === post.id);
    if (!exists) {
      posts.unshift(post); // Adicionar no início
      localStorage.setItem(storageKeys.POSTS, JSON.stringify(posts));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao salvar post:', error);
    return false;
  }
};

// Obter posts
export const getPosts = () => {
  try {
    const postsStr = localStorage.getItem(storageKeys.POSTS);
    return postsStr ? JSON.parse(postsStr) : [];
  } catch (error) {
    console.error('Erro ao obter posts:', error);
    return [];
  }
};

// Salvar post do usuário
export const saveUserPost = (userId, post) => {
  try {
    const key = storageKeys.USER_POSTS(userId);
    const userPosts = getUserPosts(userId);
    
    const exists = userPosts.some(p => p.id === post.id);
    if (!exists) {
      userPosts.unshift(post);
      localStorage.setItem(key, JSON.stringify(userPosts));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao salvar post do usuário:', error);
    return false;
  }
};

// Obter posts do usuário
export const getUserPosts = (userId) => {
  try {
    const key = storageKeys.USER_POSTS(userId);
    const postsStr = localStorage.getItem(key);
    return postsStr ? JSON.parse(postsStr) : [];
  } catch (error) {
    console.error('Erro ao obter posts do usuário:', error);
    return [];
  }
};

// Limpar posts duplicados
export const deduplicatePosts = (posts) => {
  const seen = new Set();
  return posts.filter(post => {
    const duplicate = seen.has(post.id);
    seen.add(post.id);
    return !duplicate;
  });
};

// Sincronizar posts (usar no carregamento)
export const syncPosts = async (apiPosts) => {
  const localPosts = getPosts();
  
  // Combinar posts
  const allPosts = [...localPosts];
  
  apiPosts.forEach(apiPost => {
    if (!allPosts.some(localPost => localPost.id === apiPost.id)) {
      allPosts.push(apiPost);
    }
  });
  
  // Ordenar por data
  allPosts.sort((a, b) => {
    const dateA = new Date(a.data_criacao || a.createdAt || 0);
    const dateB = new Date(b.data_criacao || b.createdAt || 0);
    return dateB - dateA;
  });
  
  // Remover duplicatas
  const uniquePosts = deduplicatePosts(allPosts);
  
  // Salvar de volta
  localStorage.setItem(storageKeys.POSTS, JSON.stringify(uniquePosts));
  
  return uniquePosts;
};