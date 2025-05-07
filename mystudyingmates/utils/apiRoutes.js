const host = "http://msmbackend.eu-4.evennode.com";
//const host = "http://192.168.2.21:3000";

export const server = host;

export const registerRoute = host + '/api/auth/register';
export const loginRoute = host + '/api/auth/login';
export const verifyRoute = host + '/api/auth/verifyEmail';
export const logoutRoute = host + '/api/auth/logout';
export const deleteAccountRoute = host + '/api/auth/deleteAccount';
export const updateEmailRoute = host + '/api/auth/updateEmail';
export const updateNameRoute = host + '/api/auth/updateName';
export const updateImageRoute = host + '/api/auth/updateImage';
export const updatePasswordRoute = host + '/api/auth/updatePassword';
export const chatHistoryRoute = host + '/api/chat/history';
export const pathsRoute = host + '/api/whiteboard/paths';
export const bubblesRoute = host + '/api/whiteboard/bubbles';
export const lockRoute = host + '/api/whiteboard/lock';
export const getPublic=host +'/api/group/getPublic';
export const getGroups=host +'/api/group/getGroups';
export const getGroup=host +'/api/group/getGroup';
export const getGroupall=host +'/api/group/getGroupall';
export const updateGroupImageRoute=host +'/api/group/updateImage';
export const groupCreateRoute=host +'/api/group/createGroup';
export const groupJoinRoute=host +'/api/group/joinGroup';
export const groupMemberRemoveRoute=host +'/api/group/removeMember';
export const getUsersRoute = host + '/api/auth/getUsers';
export const checkPremiumRoute = host + '/api/auth/checkPremium';
export const checkGroupsCreatedRoute = host + '/api/auth/checkGroupsCreated';
export const groupRoute=host+'/api/group/';
export const paymentSheetRoute=host+'/api/payment/paymentSheet';
export const fileListRoute=host+'/api/file/list'
export const fileUploadRoute=host+'/api/file/upload'
export const fileDownloadRoute=host+'/api/file/download'
export const updatePremiumRoute = host + '/api/auth/updatePremium';


