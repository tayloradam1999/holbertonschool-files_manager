import { v4 as uuidv4 } from 'uuid'; // basic authentication
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

const mongodb = require('mongodb');
const fs = require('fs'); // for access to the file system

class FilesController {
  static postUpload(req, res) {
    (async () => {
      // Retrieve the user based on the token
      // If not found, return an error Unauthorized with a status code 401
      const theTok = req.headers['x-token'];
      const theKey = await RedisClient.get(`auth_${theTok}`);
      if (!theKey) return res.status(401).send({ error: 'Unauthorized' });

      const {
        name,
        type,
        data,
        isPublic = false,
        parentId = 0,
      } = req.body;

      // missing name edgecase
      if (!name) return res.status(400).send({ error: 'Missing name' });
      // if type is not provided or of the accepted types edgecase
      if (!type) return res.status(400).send({ error: 'Missing type' });
      // if data is missing and type != folder edgecase
      if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });
      // if parentId is set
      if (parentId !== 0) {
        // assign projectId a new mongo ObjectId
        const projectId = new mongodb.ObjectId(parentId);
        // get file from projectId
        const file = await DBClient.db.collection('files').findOne({ _id: projectId });
        // if no file is present in DB for projectId edgecase
        if (!file) return res.status(400).send({ error: 'Parent not found' });
        // if file is not a folder edgecase
        if (file && file.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
      }
      let newFileDoc;
      // add userId to document saved in DB as owner of file
      // if type is folder, add newFileDoc to DB and return the newFileDoc
      if (type === 'folder') {
        newFileDoc = await DBClient.db.collection('files').insertOne({
          userId: new mongodb.ObjectId(theKey),
          name,
          type,
          isPublic,
          parentId,
        });
      } else {
        // all files stored locally. FOLDER_PATH env variable gives the path to the folder
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
        // create a local path in the storing folder with filename as uuidv4
        // but first, check if the folder already exists locally
        if (!fs.existsSync(FOLDER_PATH)) {
          fs.mkdirSync(FOLDER_PATH);
        }
        const localPath = `${FOLDER_PATH}/${uuidv4()}`;
        // data is base64 encoded, so we need to decode it
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        // write the decoded data to the local path
        // for awaits, fs has .promises
        await fs.promises.writeFile(localPath, decodedData);
        // add newFileDoc to DB and return the newFileDoc
        // - userId: ID of the owner document (owner from the authentication)
        // - name: same as the value received in the request
        // - type: same as the value received in the request
        // - isPublic: same as the value received in the request
        // - parentId: same as the value received in the request
        // - localPath: for a (type=file|image), the absolute path to the file saved locally
        newFileDoc = await DBClient.db.collection('files').insertOne({
          userId: new mongodb.ObjectId(theKey),
          name,
          type,
          isPublic,
          parentId,
          localPath,
        });
      }
      // return the newFileDoc
      return res.status(201).send({
        id: newFileDoc.insertedId, userId: theKey, name, type, isPublic, parentId,
      });
    }
    )().catch((error) => {
      console.error(error);
      res.status(500).send({ error: error.toString() });
    });
  }
    
    static async getShow(req, res) {
    // should retrieve the file document based on the ID
    // Retrieve the user based on the token
    // If not found, return an error Unauthorized with a status code 401
    const theTok = req.headers['x-token'];
    const theKey = `auth_${theKey}`;
    const user = await RedisClient.get(theKey);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
	

    const { id } = req.params; // check if any file document is linked to the id passed as parameter
    const fileId = ObjectId(id); // save fileId in ObjectId and await DbClient to search collection 'files' for the default _id that m    ongoDB generated, which is connected to the actual ID
    const fileDoc = await DBClient.db.collection('files').find({ _id: fileId }).toArray();


    // If no file document is linked to the user and the ID passed as parameter, return an error Not found with a status code 404
    // Otherwise, return the file document; each attribute will return the info starting at index 0
    if (userId.toString() !== fileDoc.userId.toString()) return res.status(404).json({ error: 'Not found' });
    return res.json({
      id: fileDoc[0]._id,
      userId,
      name: fileDoc[0].name,
      type: fileDoc[0].type,
      isPublic: fileDoc[0].isPublic,
      parentId: fileDoc[0].parentId,
    });
  }

    static async getIndex(req, res) {
   // should retrieve all users file documents for a specific parentId and with pagination
   // Retrieve the user based on the token
   // If not found, return an error Unauthorized with a status code 401
    const theTok = req.headers['x-token'];
    const theKey = `auth_${theKey}`;
    const user = await RedisClient.get(theKey);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Based on the query parameters parentId and page, return the list of file document
  // if the parentId is not linked to any user folder, returns an empty list
  // By default, parentId is equal to 0 = the root


  // Each page should be 20 items max
  // page query parameter starts at 0 for the first page. If equals to 1, it means it’s the second page (form the 20th to the 40th), etc…
  // Pagination can be done directly by the aggregate of MongoDB
    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;
    const agMatch = { $and: [{ parentId }] };
    let agData = [{ $match: agMatch }, { $skip: page * 20 }, { $limit: 20 }];
    if (parentId === 0) agData = [{ $skip: page * 20 }, { $limit: 20 }];

    const listFiles = await DBClient.db.collection('files').aggregate(agData);
    const arrFiles = [];
    await listFiles.forEach((file) => {
      const obj = {
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      };
      arrFiles.push(obj);
    });
    return res.send(arrFiles);
  }
}

module.exports = FilesController;
