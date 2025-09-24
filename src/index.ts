import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authConfig from './controllers/authConfig';
import { ExpressAuth, getSession } from "@auth/express"
import { UserCreation } from './controllers/user';
import { createPost, getPosts, getPostById, updatePost, deletePost } from './controllers/post';
import { createComment, getCommentsForPost, updateComment, deleteComment } from './controllers/comment';
import { addFriend, getFriends, getFriendRequests, updateFriendStatus, removeFriend } from './controllers/friend';
import { Request } from 'express';
dotenv.config();

const application = express();

application.use(express.json());
application.use(cors({
  origin:[
    'https://prost-project-utility-production.netlify.app/'
  ]
}));

// Public User routes (no authentication required)
application.post('/api/users', UserCreation);

application.use('/auth', ExpressAuth(authConfig));

const apiRouter = express.Router();

// Post routes
apiRouter.post('/posts', createPost);
apiRouter.get('/posts', getPosts);
apiRouter.get('/posts/:id', getPostById);
apiRouter.put('/posts/:id', updatePost);
apiRouter.delete('/posts/:id', deletePost);
apiRouter.post('/comments', createComment);
apiRouter.get('/posts/:postId/comments', getCommentsForPost);
apiRouter.put('/comments/:id', updateComment);
apiRouter.delete('/comments/:id', deleteComment);
apiRouter.post('/friends', addFriend);
apiRouter.get('/users/:userId/friends', getFriends);
apiRouter.get('/users/:userId/friend-requests', getFriendRequests);
apiRouter.put('/friends/:id', updateFriendStatus);
apiRouter.delete('/friends/:id', removeFriend);

// Webhook route
apiRouter.post('/webhooks', (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).send('Webhook received');
});
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
  console.log('POST   /api/webhooks');
  console.log('-------------------------');
});
