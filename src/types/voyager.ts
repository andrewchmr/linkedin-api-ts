export interface VoyagerEntity {
  $type: string;
  entityUrn?: string;
}

export interface VoyagerNormalizedResponse {
  included?: VoyagerEntity[];
  data?: Record<string, unknown>;
}

export interface VoyagerProfileEntity extends VoyagerEntity {
  publicIdentifier?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  locationName?: string;
  summary?: string;
  geoLocation?: {
    '*geo'?: string;
    geoUrn?: string;
  };
  profilePicture?: {
    displayImageReference?: {
      vectorImage?: VoyagerVectorImage;
    };
  };
}

export interface VoyagerGeoEntity extends VoyagerEntity {
  defaultLocalizedName?: string;
}

export interface VoyagerPositionEntity extends VoyagerEntity {
  title?: string;
  companyName?: string;
  locationName?: string;
  dateRange?: VoyagerDateRange;
  description?: string;
  employmentType?: string;
}

export interface VoyagerEducationEntity extends VoyagerEntity {
  schoolName?: string;
  degreeName?: string;
  fieldOfStudy?: string;
  dateRange?: VoyagerDateRange;
}

export interface VoyagerSkillEntity extends VoyagerEntity {
  name?: string;
  endorsementCount?: number;
}

export interface VoyagerCertificationEntity extends VoyagerEntity {
  name?: string;
  authority?: string;
  dateRange?: VoyagerDateRange;
}

export interface VoyagerLanguageEntity extends VoyagerEntity {
  name?: string;
  proficiency?: string;
}

export interface VoyagerProjectEntity extends VoyagerEntity {
  title?: string;
  description?: string;
  url?: string;
  dateRange?: VoyagerDateRange;
}

export interface VoyagerPublicationEntity extends VoyagerEntity {
  name?: string;
  description?: string;
  url?: string;
  publisher?: string;
  publishedOn?: VoyagerDate;
}

export interface VoyagerSearchEntity extends VoyagerEntity {
  title?: { text?: string };
  primarySubtitle?: { text?: string };
  secondarySubtitle?: { text?: string };
  navigationUrl?: string;
  navigationContext?: { url?: string };
  image?: {
    attributes?: Array<{
      detailData?: {
        nonEntityProfilePicture?: { vectorImage?: VoyagerVectorImage };
        profilePicture?: { vectorImage?: VoyagerVectorImage };
      };
    }>;
  };
}

export interface VoyagerSearchResponse extends VoyagerNormalizedResponse {
  data?: {
    data?: {
      searchDashClustersByAll?: VoyagerSearchClusters;
    };
    searchDashClustersByAll?: VoyagerSearchClusters;
  };
}

export interface VoyagerSearchClusters {
  paging?: { total?: number; start?: number; count?: number };
}

export interface VoyagerDateRange {
  start?: VoyagerDate;
  end?: VoyagerDate;
}

export interface VoyagerDate {
  month?: number;
  year?: number;
  day?: number;
}

export interface VoyagerVectorImage {
  rootUrl?: string;
  artifacts?: VoyagerArtifact[];
}

export interface VoyagerArtifact {
  fileIdentifyingUrlPathSegment?: string;
  width?: number;
  height?: number;
}
