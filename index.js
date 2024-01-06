

const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = "mongodb+srv://taskMaster:fa0rPNlqX8UEoEv6@taskmaster.xualaxs.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = await client.db('taskmaster');
    const tasksCollection = db.collection('tasks');
    console.log('Successfully connected to MongoDB!'+uri);

    // app.get('/t', (req, res) => {
    //   res.send(`Task Master Server ${uri}`);
    // });

    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await tasksCollection.find({}).toArray();
        console.log(tasks)
        res.json(tasks);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/tasks', async (req, res) => {
      const newTask = req.body;

      try {
        const result = await tasksCollection.insertOne(newTask);
        res.status(201).json(result);
      } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.delete('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
         console.log(taskId,"my task id")
      try {
        const result = await tasksCollection.deleteOne({
          _id:new ObjectId(taskId)
        });
        console.log(result,"result")
        if (result.deletedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task deleted successfully' });
        }
      } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.patch('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      const updatedTaskData = req.body;

      try {
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTaskData }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({ error: 'Task not found' });
        } else {
          res.json({ message: 'Task updated successfully' });
        }
      } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  } finally {
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('task master server is Running')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
