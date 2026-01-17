import express, { type Request, type Response } from "express";
import { nanoid } from "nanoid"; 
import { createRoom, hasRoom } from "./roomManager.js";

const router = express.Router();

router.get('/id', (req: Request, res: Response) => {
  res.status(200).json(nanoid()); 
})

router.get('/room/:id', (req: Request, res: Response) => {
  const roomId = String(req.params.id);
  if(roomId && hasRoom(roomId)) {
    return res.status(200).send(`${roomId} found`);
  } else {
    return res.status(404).send(`${roomId} not found`);
  }
})
router.post('/room', (req: Request, res: Response) => {
  const roomId = nanoid();
  createRoom(roomId);
  return res.status(201).json({roomId});
})

export default router;
