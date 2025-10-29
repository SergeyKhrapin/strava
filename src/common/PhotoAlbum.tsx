import { type Dispatch, type FC } from "react"
import { RowsPhotoAlbum, type Photo } from "react-photo-album"

interface IPhotoAlbum {
  photos: Photo[]
  setIndex: Dispatch<React.SetStateAction<number>>
}

export const PhotoAlbum: FC<IPhotoAlbum> = ({ photos, setIndex }) => {
  return (
    <RowsPhotoAlbum
      photos={photos}
      targetRowHeight={150}
      onClick={({ index }: { index: number }) => setIndex(index)}
      spacing={(containerWidth) => {
        if (containerWidth >= 1200) {
          return 10
        } else if (containerWidth < 1200 && containerWidth >= 600) {
          return 8
        } else if (containerWidth < 600 && containerWidth >= 300) {
          return 6
        } else {
          return 4
        }
      }}
    />
  )
}
