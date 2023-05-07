import * as Yup from 'yup';
import { isEmpty } from 'ramda';
import React, { useState } from 'react';
import { EditMember } from '../createMember';
import { createNewDynForMember, setProfilePhoto } from '../../functions/firestore';
import { Box, Button, Flex, Form, IconWithText, ListItem, Loader, Text, Title, UploadImage } from 'exsportia-components';
import ProfileGallery from './components/gallery';

const CreateDynForm = ({
  member,
  members,
  closeModal,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  if (isLoading) return (
    <Box position='absolute' top='50%' left='45%'>
      <Loader />
    </Box>
  )
  return (
    <Flex mb='24px'>
      <Form
        text=''
        settings={{
          footer: {
            buttons: {
              submitButton: {
                text: 'Створити',
                styleType: 'secondary'
              },
              cancelButton: {
                styleType: 'link',
                text: 'Відмінити',
                onClick: closeModal,
              }
            }
          }
        }}
        onSubmit={(values) => {
          setIsLoading(true);
          createNewDynForMember({
            member,
            members,
            onSuccess: closeModal,
            dynastyName: values.dynastyName,
          })
        }}
        initialValues={{
          dynastyName: ''
        }}
        validationSchema={Yup.object().shape({
          dynastyName: Yup.string()
        })}
        fields={[
          {
            fieldType: 'text',
            label: 'Введіть назву роду (це може бути прізвище)',
            input: {
              id: 'dynastyName',
              name: 'dynastyName'
            }
          }
        ]}
      />
    </Flex>
  )
}


const profileSettings = ({ member, members, setCurMember }) => {
  const parents = members.filter(
    (item) => (member.parents || []).some(el => el === item.id)
  );
  const children = members.filter(
    (item) => (item.parents || []).some(el => el === member.id)
  );
  const actualSpouse = !!member.actualSpouse
    ? members.find(
      ({ id }) => id === member.actualSpouse
    )
    : ''
  return ([
    {
      value: member.dob,
      field: 'Дата народження',
    },
    {
      value: member.dod,
      display: member.isDead,
      field: 'Дата смерті',
    },
    {
      value: member.maidenName,
      field: 'Дівоче прізвище',
      display: !!member.maidenName,
    },
    {
      field: 'Стать',
      value: member.gender === 'FEMALE' ? 'Жінка' : 'Чоловік',
    },
    ...parents.map((parent, index) => ({
      key: index,
      field: parent.gender === 'MALE' ? 'Батько' : 'Мати',
      value: (
        <Flex alignItems='center'>
          <Flex mr='16px'>
            <Text text={`${parent.surname} ${parent.name} ${parent.fathersName}`} />
          </Flex>
          <Flex cursor='pointer' onClick={() => setCurMember(parent)} styleType='control'>
            <IconWithText icon='user' />
          </Flex>
        </Flex>
      ),
    })),
    {
      field: 'Діти',
      display: !isEmpty(children),
      value: (
        children.map((child, index) => (
          <Flex key={index} alignItems='center'>
            <Flex mr='16px'>
              <Text text={`${child.surname} ${child.name} ${child.fathersName}`} />
            </Flex>
            <Flex cursor='pointer' onClick={() => setCurMember(child)} styleType='control'>
              <IconWithText icon='user' />
            </Flex>
          </Flex>
        ))
      ),
    },
    {
      field: actualSpouse.gender === 'MALE' ? 'Чоловік' : 'Дружина',
      display: !isEmpty(actualSpouse),
      value: ((
        <Flex alignItems='center'>
          <Flex mr='16px'>
            <Text text={`${actualSpouse.surname} ${actualSpouse.name} ${actualSpouse.fathersName}`} />
          </Flex>
          <Flex cursor='pointer' onClick={() => setCurMember(actualSpouse)} styleType='control'>
            <IconWithText icon='user' />
          </Flex>
        </Flex>
      )
      ),
    }
  ]);
};

const ConfirmationModal = ({ onSubmit, closeModal }) => (
  <Flex flexDirection='column'>
    <Title text='Видалення фото' />
    <Text text='Ви впевнені, що хочете видалити це фото? Цей процес незворотній, тож будьте обережні' />
    <Flex justifyContent='flex-end'>
      <Button text='Відмінити' styleType='secondary' onClick={closeModal} />
      <Button text='Видалити' settings={{ bg: 'red', m: '0 0 16px 16px' }} onClick={onSubmit} />
    </Flex>
  </Flex>
);

const ProfileModal = ({
  dyns,
  curDyn,
  member,
  members,
  selectDyn,
  openModal,
  guestMode,
  closeModal,
  setMembers,
}) => {
  const [curMember, setCurMember] = useState(member)
  const photo = curMember.photo;
  return (
    <Box pb={['48px', '20px']}>
      <Title text={`${curMember.surname} ${curMember.name} ${curMember.fathersName}`} />
      <Flex mb='16px' mr='16px' justifyContent='space-around' p='20px' borderRadius='16px' border='1px solid'>
        <Flex flexDirection='column' mr='16px' justifyContent='center'>
          <Flex justifyContent='center'>
            {
              !!photo
                ? <Box
                  borderRadius='12px'
                  backgroundSize='cover'
                  width={['140px', '200px']}
                  height={['210px', '300px']}
                  backgroundImage={`url(${photo})`} />
                : <Flex
                  border='1px solid'
                  borderRadius='12px'
                  alignItems='center'
                  justifyContent='center'
                  width={['140px', '200px']}
                  height={['210px', '300px']}
                >
                  Фото поки що немає
                </Flex>
            }
          </Flex>
          <Flex justifyContent='center' mt='36px' mb='16px'>
            <UploadImage
              icon=''
              disabled={guestMode}
              label={!!photo ? 'Замінити фото профіля' : 'Додати фото профіля'}
              settings={{
                cropSize: {
                  width: 200,
                  height: 300
                }
              }}
              onChange={(el) => setProfilePhoto({
                curDyn,
                photo: el,
                setMembers,
                setCurMember,
                memberId: curMember.id,
              })} />
          </Flex>
          {!!photo && <Flex justifyContent='center'>
            <Button
              icon=''
              styleType='secondary'
              disabled={guestMode}
              text='Видалити фото профіля'
              onClick={() => {
                openModal({
                  footerConfig: {
                    disabled: true,
                  },
                  headerConfig: {
                    disabled: true,
                  },
                  component: (
                    <ConfirmationModal
                      closeModal={closeModal}
                      onSubmit={() => {
                        setProfilePhoto({
                          curDyn,
                          photo: '',
                          setMembers,
                          setCurMember,
                          memberId: curMember.id,
                        })
                      }} />),
                })
              }}
              settings={{
                color: 'red',
                width: '100%'
              }} />
          </Flex>}
          <Button
            styleType='secondary'
            settings={{ m: '32px 0 0 0', width: '100%' }}
            onClick={() => openModal({
              footerConfig: {
                disabled: true,
              },
              headerConfig: {
                disabled: true,
              },
              component: (
                <ProfileGallery
                  curDyn={curDyn}
                  memberId={member.id}
                  guestMode={guestMode}
                  openModal={openModal}
                  setMembers={setMembers}
                  gallery={curMember.gallery}
                  setCurMember={setCurMember} />
              )
            })}
          >
            Галерея
          </Button>
        </Flex>
        <Box pb='24px' flexDirection='column'>
          {
            profileSettings({
              members,
              setCurMember,
              member: curMember,
            }).map(
              ({ field, value, display }, index) => (display !== false) && (
                <ListItem
                  key={index}
                  text={value}
                  subText={field}
                  styleType='summary' />
              )
            )
          }
        </Box>
      </Flex>
      <Flex justifyContent='space-between'>
        {
          curMember.dynastyIds.length === 0
            ? (
              <Button
                styleType='secondary'
                text='Створити новий рід'
                onClick={() => openModal({
                  title: 'Створення нового роду',
                  footerConfig: {
                    disabled: true,
                  },
                  settings: {
                    header: {
                      compact: {
                        width: 'auto'
                      }
                    }
                  },
                  component: (
                    <CreateDynForm member={member} members={members} closeModal={closeModal} />
                  )
                })} />
            )
            : <Button
              text='Роди'
              disabled={guestMode}
              styleType='secondary'
              onClick={() => openModal({
                title: 'Виберіть рід',
                footerConfig: {
                  disabled: true,
                },
                settings: {
                  header: {
                    compact: {
                      width: 'auto'
                    }
                  }
                },
                component: (
                  <Flex alignItems='center' mb='32px' flexDirection='column'>
                    {
                      member.dynastyIds.map((dynId) => {
                        const curMemberDyn = dyns.find(({ id }) => id === dynId);
                        return (
                          <Flex mb='16px'>
                            <Button
                              styleType='secondary'
                              text={curMemberDyn.dynastyName}
                              onClick={() => {
                                selectDyn(curMemberDyn.id)
                                closeModal()
                              }} />
                          </Flex>
                        )
                      })
                    }
                  </Flex>
                )
              })} />
        }
        <Flex justifyContent='end'>
          <Button onClick={closeModal} text='Закрити' styleType='link' settings={{ m: '0 16px 0 0' }} />
          <Button
            text='Редагувати'
            disabled={guestMode}
            styleType='secondary'
            onClick={() => openModal({
              title: 'Редагування родича',
              component: <EditMember member={member} closeAllModals={closeModal} setMembers={setMembers} dyn={curDyn} members={members} />,
              footerConfig: {
                disabled: true
              },
              settings: {
                header: {
                  compact: {
                    width: 'auto',
                  }
                }
              },
            })} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default ProfileModal;
