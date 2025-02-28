import express from 'express';
import {
  createCharacter,
  getAllCharactersStatus,
  getCharacterProfile,
  getCharacterStatus,
  getSchedule,
  startCharacter,
  stopCharacter,
  updateCharacterProfile,
  updateSchedule,
} from '../controllers/characterController.js';

const router = express.Router();

router.post('/', createCharacter);
router.post('/:name/start', startCharacter);
router.post('/:name/stop', stopCharacter);
router.put('/:name/schedule', updateSchedule);
router.get('/:name/schedule', getSchedule);
router.put('/:name/profile', updateCharacterProfile);
router.get('/:name/profile', getCharacterProfile);
router.get('/status', getAllCharactersStatus);
router.get('/:name/status', getCharacterStatus);

export default router;
