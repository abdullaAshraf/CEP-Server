"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Community_1 = __importDefault(require("../schema/Community"));
const Invitation_1 = __importDefault(require("../schema/Invitation"));
const User_1 = __importDefault(require("../schema/User"));
const validation_1 = __importDefault(require("../services/validation"));
const verify_1 = require("./verify");
const router = express_1.default.Router();
// Add Community
router.post('/', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const error = validation_1.default.communityValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    //Create new community
    const community = new Community_1.default({
        name: req.body.name,
        description: req.body.description,
        owner: req.user
    });
    try {
        const savedCommunity = yield community.save();
        const user = yield User_1.default.findById(req.user);
        user.communities.push(savedCommunity._id);
        yield user.save();
        res.status(201).send(savedCommunity);
    }
    catch (err) {
        res.status(400).send(err);
    }
}));
// Edit Community
router.put('/:id', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const error = validation_1.default.communityValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const community = yield Community_1.default.findById(req.params.id);
    if (community.owner.toString() !== req.user._id) {
        return res.status(403).send('Unauthorized Access');
    }
    try {
        //Update community
        const result = yield Community_1.default.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
}));
// Delete or Leave Community
router.delete('/:id', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const community = yield Community_1.default.findById(req.params.id);
    if (community.owner.toString() !== req.user._id) {
        // delete community
        yield User_1.default.updateMany({ communities: req.params.id }, {
            $pullAll: {
                communities: [{ _id: req.params.id }],
            },
        });
        yield Invitation_1.default.deleteMany({ community: req.params.id });
        yield Community_1.default.deleteOne({ _id: req.params.id });
        res.status(200).send("Deleted");
    }
    else {
        // leave community
        yield User_1.default.updateOne({ _id: req.user }, {
            $pullAll: {
                communities: [{ _id: req.params.id }],
            },
        });
        res.status(200).send('Left');
    }
}));
// Get User Communities
router.get('/', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const owned = req.query.owned == null ? false : req.query.owned;
    if (owned) {
        // return only owned communities
        const communities = yield Community_1.default.find({ owner: req.user });
        res.status(200).send(communities);
    }
    else {
        // return all communities that the user is a member in including owned ones
        const user = yield User_1.default.findById(req.user).populate('communities');
        res.status(200).send(user.communities);
    }
}));
// Get Community Current Members
router.get('/:id/member', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const members = yield User_1.default.find({ communities: req.params.id });
    if (members.some(member => member._id.toString() === req.user._id)) {
        const response = members.map(member => ({
            name: member.name,
            email: member.email
        }));
        res.status(200).send(response);
    }
    else {
        res.status(403).send('Unauthorized Access');
    }
}));
// Get Community Current invitations
router.get('/:id/invitation', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const community = yield Community_1.default.findById(req.params.id);
    if (community.owner.toString() !== req.user._id) {
        res.status(403).send('Unauthorized Access');
        return;
    }
    const invitations = yield Invitation_1.default.find({ community: req.params.id });
    res.status(200).send(invitations);
}));
// Invite User by email
router.post('/:id/invitation', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const community = yield Community_1.default.findById(req.params.id);
    if (community.owner.toString() !== req.user._id) {
        return res.status(403).send('Unauthorized Access');
    }
    const user = yield User_1.default.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).send('User Not Found');
    }
    if (user.communities.some((communityId) => communityId.toString() === req.params.id)) {
        return res.status(404).send('User Already member of this community');
    }
    const currentInvitation = yield Invitation_1.default.findOne({ user: user._id, community: req.params.id });
    if (currentInvitation) {
        return res.status(404).send('User Already invited of this community');
    }
    const invitation = new Invitation_1.default({
        community: req.params.id,
        user: user._id
    });
    const savedInvitation = yield invitation.save();
    res.status(201).send(savedInvitation);
}));
// List My invitation
router.get('/invitation', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invitations = yield Invitation_1.default.find({ user: req.user });
    res.status(200).send(invitations);
}));
// Respond to invitation
router.put('/invitation/:id', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const invitation = yield Invitation_1.default.findById(req.params.id);
    if (!invitation || invitation.user.toString() !== req.user._id) {
        return res.status(403).send('Unauthorized Access');
    }
    if (req.body.response === 'accept') {
        yield User_1.default.updateOne({ _id: req.user }, { $push: { communities: invitation.community } });
        yield invitation.delete();
        return res.status(200).send('Invitation Accepted');
    }
    else if (req.body.response === 'decline') {
        yield invitation.delete();
        return res.status(200).send('Invitation Declined');
    }
    else {
        return res.status(400).send('Invalid Response');
    }
}));
exports.default = router;
