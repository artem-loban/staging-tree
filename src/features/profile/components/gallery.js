import React, { useState } from 'react';
import GalleryImage from './gallery-image';
import { addPhotoToGallery } from '../../../functions/firestore';
import { Flex, MediaCard, Title, UploadImage } from 'exsportia-components';


const ProfileGallery = ({
  curDyn,
  memberId,
  openModal,
  guestMode,
  setMembers,
  setCurMember,
  gallery = [],

}) => {
  const [galleryToUse, setGalleryToUse] = useState(gallery);
  return <Flex flexDirection='column'>
    <Title text='Галерея' />
    <Title
      styleType='h3' text='Ця галерея поки що порожня'
      settings={{
        display: galleryToUse.length > 0 ? 'none' : 'flex'
      }} />
    <Flex flexWrap='wrap' mb='24px'>
      {
        galleryToUse.map((base64Image, index) => (
          <Flex
            p='4px'
            cursor='pointer'
            onClick={() => openModal({
              footerConfig: {
                disabled: true,
              },
              headerConfig: {
                disabled: true,
              },
              settings: {
                modalBody: {
                  width: 'min-content'
                }
              },
              component: (
                <GalleryImage
                  curDyn={curDyn}
                  memberId={memberId}
                  currentIndex={index}
                  setMembers={setMembers}
                  allImages={galleryToUse}
                  setCurMember={setCurMember}
                  setGalleryToUse={setGalleryToUse} />
              )
            })}
          >
            <MediaCard
              image={base64Image}
              settings={{
                width: '200px',
                height: '160px',
                buttonFavoriteSettings: {
                  buttonSettings: {
                    icon: 'fullscreen'
                  }
                }
              }} />
          </Flex>
        ))
      }
    </Flex>
    <Flex justifyContent='end' mb='24px'>
      <UploadImage
        icon=''
        disabled={guestMode}
        label={'Додати'}
        settings={{
          cropSize: {
            width: 300,
            height: 200
          }
        }}
        onChange={(el) => {
          addPhotoToGallery({
            curDyn,
            memberId,
            photo: el,
            setMembers,
            setCurMember,
          });
          setGalleryToUse([
            ...galleryToUse,
            el
          ])
        }} />
    </Flex>
  </Flex>
};

export default ProfileGallery;
