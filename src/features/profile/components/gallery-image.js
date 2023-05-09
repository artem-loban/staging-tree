import React, { useContext, useState } from 'react';
import { Button, Flex, ModalContext } from 'exsportia-components';
import { removePhotoFromGallery } from '../../../functions/firestore';

const GalleryImage = ({
  curDyn,
  memberId,
  setMembers,
  setCurMember,
  currentIndex,
  allImages = [],
  setGalleryToUse,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const { closeModal } = useContext(ModalContext);
  const turnRight = () => {
    if (currentImageIndex === allImages.length - 1) {
      return setCurrentImageIndex(0)
    }
    return setCurrentImageIndex(currentImageIndex + 1)
  }
  const turnLeft = () => {
    if (currentImageIndex === 0) {
      return setCurrentImageIndex(allImages.length - 1)
    }
    return setCurrentImageIndex(currentImageIndex - 1)
  }
  return (
    <Flex flexDirection='column' alignItems='center'>
      <Flex alignItems='center' maxHeight='90vh'>
        <Button
          icon='arrowLeft'
          onClick={turnLeft}
          styleType='secondary'
          settings={{ m: '0 32px 0 0' }} />
        <img style={{ maxHeight: '90vh', maxWidth: '70vw' }} alt={`#${currentImageIndex}`} src={allImages[currentImageIndex]} />
        <Button
          icon='arrowRight'
          onClick={turnRight}
          styleType='secondary'
          settings={{ m: '0 0 0 32px' }} />
      </Flex>
      <Button
        text='Видалити'
        styleType='secondary'
        settings={{ color: 'red', m: '24px 0 24px' }}
        onClick={() => {
          removePhotoFromGallery({
            curDyn,
            memberId,
            setMembers,
            setCurMember,
            index: currentImageIndex
          });
          setGalleryToUse([...allImages].reduce(
            (acc, cur) => {
              if (cur === allImages[currentImageIndex]) return acc;
              return [...acc, cur];
            },
            []
          ));
          closeModal()
        }} />
    </Flex>
  )
}

export default GalleryImage;
