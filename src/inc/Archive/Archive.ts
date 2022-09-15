
export enum MediaType {
  Account = 'account',
  Audio = 'audio',
  Data = 'data',
  Image = 'image',
  Movies = 'movies',
  Texts = 'texts',
  Web = 'web',
}

export const AllMediaTypes: { [key: string]: MediaType } = {
  Account: MediaType.Account,
  Audio: MediaType.Audio,
  Data: MediaType.Data,
  Image: MediaType.Image,
  Movies: MediaType.Movies,
  Texts: MediaType.Texts,
  Web: MediaType.Web,
};
