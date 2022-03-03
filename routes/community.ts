import express from 'express';
import { ObjectId } from 'mongoose';
import Community from '../schema/Community';
import Invitation from '../schema/Invitation';
import User from '../schema/User';
import ValidationService from '../services/validation';
import {token} from './verify';

const router = express.Router();

// Add Community
router.post('/', token, async (req: any, res, next) => {
  const error = ValidationService.communityValidation(req.body);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }

  //Create new community
  const community = new Community({
      name: req.body.name,
      description: req.body.description,
      owner: req.user
  });

  try {
      const savedCommunity = await community.save();
      const user = await User.findById(req.user);
      user.communities.push(savedCommunity._id);
      await user.save();
      res.status(201).send(savedCommunity);
  } catch (err) {
      res.status(400).send(err);
  }
});

// Edit Community
router.put('/:id', token, async (req: any, res, next) => {
  const error = ValidationService.communityValidation(req.body);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }

  const community = await Community.findById(req.params.id);
  if (community.owner.toString() !== req.user._id) {
    return res.status(403).send('Unauthorized Access');
  }

  try {
      //Update community
      const result = await Community.findByIdAndUpdate(req.params.id, 
        {
          name: req.body.name,
          description: req.body.description
        });
    
      res.status(200).send(result);
  } catch (err) {
      res.status(400).send(err);
  }
});

// Delete or Leave Community
router.delete('/:id', token, async (req: any, res, next) => {
  const community = await Community.findById(req.params.id);
  if (community.owner.toString() !== req.user._id) {
    // delete community
    await User.updateMany({communities: req.params.id}, {
      $pullAll: {
        communities: [{_id: req.params.id}],
      },
    });
    await Invitation.deleteMany({community: req.params.id});
    await Community.deleteOne({_id: req.params.id});
    res.status(200).send("Deleted");
  } else {
    // leave community
    await User.updateOne({_id: req.user}, {
      $pullAll: {
        communities: [{_id: req.params.id}],
      },
    });
    res.status(200).send('Left');
  }
});

// Get User Communities
router.get('/', token, async (req: any, res, next) => {
  const owned = req.query.owned == null ? false : req.query.owned;
  if (owned) {
    // return only owned communities
    const communities = await Community.find({owner: req.user})
    res.status(200).send(communities);
  } else {
    // return all communities that the user is a member in including owned ones
    const user = await User.findById(req.user).populate('communities');
    res.status(200).send(user.communities);
  }
});

// Get Community Current Members
router.get('/:id/member', token, async (req: any, res, next) => {
  const members = await User.find({communities: req.params.id});
  if (members.some(member => member._id.toString() === req.user._id)) {
    const response = members.map(member => ({
      name: member.name,
      email: member.email
    }));
    res.status(200).send(response);
  } else {
    res.status(403).send('Unauthorized Access');
  }
});

// Get Community Current invitations
router.get('/:id/invitation', token, async (req: any, res, next) => {
  const community = await Community.findById(req.params.id);
  if (community.owner.toString() !== req.user._id) {
    res.status(403).send('Unauthorized Access');
    return;
  }
  const invitations = await Invitation.find({community: req.params.id});
  res.status(200).send(invitations);
});

// Invite User by email
router.post('/:id/invitation', token, async (req: any, res, next) => {
  const community = await Community.findById(req.params.id);
  if (community.owner.toString() !== req.user._id) {
    return res.status(403).send('Unauthorized Access');
  }
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return res.status(404).send('User Not Found');
  }

  if (user.communities.some((communityId: ObjectId) => communityId.toString() === req.params.id)) {
    return res.status(404).send('User Already member of this community');
  }

  const currentInvitation = await Invitation.findOne({user: user._id, community: req.params.id});
  if (currentInvitation) {
    return res.status(404).send('User Already invited of this community');
  }

  const invitation = new Invitation({
    community: req.params.id,
    user: user._id
  });
  const savedInvitation = await invitation.save();
  res.status(201).send(savedInvitation);
});

// List My invitation
router.get('/invitation', token, async (req: any, res, next) => {
  const invitations = await Invitation.find({user: req.user});
  res.status(200).send(invitations);
});

// Respond to invitation
router.put('/invitation/:id', token, async (req: any, res, next) => {
  const invitation = await Invitation.findById(req.params.id);
  if (!invitation || invitation.user.toString() !== req.user._id) {
    return res.status(403).send('Unauthorized Access');
  }

  if (req.body.response === 'accept') {
    await User.updateOne(
      { _id: req.user }, 
      { $push: { communities: invitation.community } }
    );
    await invitation.delete();
    return res.status(200).send('Invitation Accepted');
  } else if (req.body.response === 'decline') {
    await invitation.delete();
    return res.status(200).send('Invitation Declined');
  } else {
    return res.status(400).send('Invalid Response');
  }
});

export default router;
