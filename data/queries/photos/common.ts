export const getPhotosCommonFields = (shouldIncludeAuthorData: boolean) => `
id
albumName
albumType
createdBy
${shouldIncludeAuthorData ? `
createdByPerson {
  id
  personId
  firstName
  lastName
  nowPhoto {
    id
    display {
      url
      width
      height
    }
    thumbnail {
      url
      width
      height
    }
  }
  thenPhoto {
    id
    display {
      url
      width
      height
    }
    thumbnail {
      url
      width
      height
    }
  }
}
` : ''}
display {
  url
  width
  height
}
visibleState
creationDate
`;
