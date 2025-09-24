import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// User Controllers
import { UserCreation, clerkWebhookHandler } from './controllers/user';

// Post Controllers
import { createPost, getPosts, getPostById, updatePost, deletePost } from './controllers/post';

// Comment Controllers
import { createComment, getCommentsForPost, updateComment, deleteComment } from './controllers/comment';

// Friend Controllers
import { addFriend, getFriends, getFriendRequests, updateFriendStatus, removeFriend } from './controllers/friend';

dotenv.config();
const application = express();

// The webhook needs the raw body to verify the signature.
// This must be configured before express.json()
application.post('/api/webhooks/clerk', express.raw({type: 'application/json'}), clerkWebhookHandler);

application.use(express.json());
application.use(cors({
  origin:[
    'https://prost-project-utility-production.netlify.app/'
  ]
}));

const apiRouter = express.Router();

// User routes
apiRouter.post('/users', UserCreation);

// Post routes
apiRouter.post('/posts', createPost);
apiRouter.get('/posts', getPosts);
apiRouter.get('/posts/:id', getPostById);
apiRouter.put('/posts/:id', updatePost);
apiRouter.delete('/posts/:id', deletePost);

// Comment routes
apiRouter.post('/comments', createComment);
apiRouter.get('/posts/:postId/comments', getCommentsForPost);
apiRouter.put('/comments/:id', updateComment);
apiRouter.delete('/comments/:id', deleteComment);

// Friend routes
apiRouter.post('/friends', addFriend);
apiRouter.get('/users/:userId/friends', getFriends);
apiRouter.get('/users/:userId/friend-requests', getFriendRequests);
apiRouter.put('/friends/:id', updateFriendStatus);
apiRouter.delete('/friends/:id', removeFriend);

application.use('/api', apiRouter);

const port = parseInt(process.env.PORT || '', 10) || 3000;
application.listen(port, () => {
  console.log(`Server connected on http://localhost:${port}`);
  console.log('\nRegistered API Endpoints:');
  console.log('-------------------------');
  console.log('POST   /api/users');
  console.log('POST   /api/posts');
  console.log('GET    /api/posts');
  console.log('GET    /api/posts/:id');
  console.log('PUT    /api/posts/:id');
  console.log('DELETE /api/posts/:id');
  console.log('POST   /api/comments');
  console.log('GET    /api/posts/:postId/comments');
  console.log('PUT    /api/comments/:id');
  console.log('DELETE /api/comments/:id');
  console.log('POST   /api/friends');
  console.log('GET    /api/users/:userId/friends');
  console.log('GET    /api/users/:userId/friend-requests');
  console.log('PUT    /api/friends/:id');
  console.log('DELETE /api/friends/:id');
  console.log('-------------------------');
  console.log('Webhook Endpoint:');
  console.log('POST   /api/webhooks/clerk');
  console.log('-------------------------');
});
