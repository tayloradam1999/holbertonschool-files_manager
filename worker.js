import { v4 as uuidv4 } from 'uuid'; // basic authentication
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';
const mongodb = require('mongodb');
const fs = require('fs'); // for access to the file system
import Queue from 'bull';
import { ObjectID } from 'mongodb';
import imageThumbnail from 'image-thumbnail';

// Create two new queues to process
const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

fileQueue.process(job, done) {
  (async () => {
  // If fileId is not present in the job, raise an error Missing fileId
  // If userId is not present in the job, raise an error Missing userId
  if (!job.data.fileId) throw new Error('Missing fileId');
  if (!job.data.userId) throw new Error('Missing userId');

  // If no document is found in DB based on the fileId and userId, raise an error File not found
  const files = dbClient.db.collection('files');
  const fileArray = await files.find(
    { userId: ObjectID(job.data.userId), _id: ObjectID(job.data.fileId) },
  ).toArray();
  if (fileArray.length === 0) throw new Error('File not found');
 })();
}
