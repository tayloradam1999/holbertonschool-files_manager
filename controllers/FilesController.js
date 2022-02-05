import { v4 as uuidv4 } from 'uuid';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';
const { ObjectId } = require('mongodb');
const fs = require('fs'); // for access to the file system

class FilesController {
  static async postUpload(req, res) {
   // Retrieve the user based on the token
   // If not found, return an error Unauthorized with a status code 401
    const theTok = req.headers('X-Token');
    if (!theTok) return res.status(401).send({ error: 'Unauthorized' });

    const theKey = await RedisClient.get(`auth_${token}`);
    if (!theKey) return res.status(401).send({ error: 'Unauthorized' });

    const {
        name,
        type,
        parentId,
        data,
        isPublic = false
    } = request.body;

    // If the name is missing, return an error Missing name with a status code 400
    // const name = await DBClient.db.collection('users').findOne({ _id: ObjectId(theKey) });
    if (!name) return res.status(400).send({ error: 'Missing name' });
    
    // If the type is missing or not part of the list of accepted type, return an error Missing type with a status code 400
    const Filetype = req.body.type;
    if (!Filetype || !['folder', 'file', 'image'].includes(Filetype)) return res.status(400).send({ error: 'Missing type' });

    // If the data is missing and type != folder, return an error Missing data with a status code 400
    const FileData = req.body.data;
    if (!FileData && ['file', 'image'].includes(Filetype)) return res.status(400).send({ error: 'Missing data' });
  

}}