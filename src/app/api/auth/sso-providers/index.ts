import Auth0 from './auth0';
import Authentik from './authentik';
import AzureAD from './azure-ad';
import Credentials from './credentials';
import Github from './github';

export const ssoProviders = [Auth0, Authentik, AzureAD, Credentials, Github];
