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
}

module.exports = FilesController;
