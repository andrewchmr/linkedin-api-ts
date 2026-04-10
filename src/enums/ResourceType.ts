export enum ResourceType {
  PROFILE_BY_USERNAME = '/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity={username}&decorationId=com.linkedin.voyager.dash.deco.identity.profile.FullProfileWithEntities-109',
  PEOPLE_SEARCH = '/voyager/api/graphql?variables=(start:{start},query:(keywords:{keywords},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE)))))&queryId=voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0',
  ME = '/voyager/api/me',
}
