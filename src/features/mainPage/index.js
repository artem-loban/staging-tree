import * as Yup from 'yup';
import moment from 'moment';
import ProfileModal from '../profile';
import CreateMember from '../createMember/index.js';
import { getAllDyns, getMembersByDyn } from '../../functions/firestore';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { isNil, isEmpty, any, propSatisfies, without, sort, pathOr } from 'ramda';
import { Box, Button, Flex, Form, IconWithText, Loader, ModalContext, Text, Title } from 'exsportia-components';

const isNilOrEmpty = (arg) => isNil(arg) || isEmpty(arg);

const TreeBranch = ({
  branch,
  root = {},
  openProfile,
  fullSpousesMemberId,
  setFullSpousesMemberId
}) => {
  if (isNilOrEmpty(root)) return (
    <Box position='absolute' top='50%' left='45%'>
      <Loader />
    </Box>
  )
  const f1 = sort(
    (a, b) => {
      return moment(a.dob, 'DD.MM.YYYY').valueOf() - moment(b.dob, 'DD.MM.YYYY').valueOf();
    },
    branch.filter(
      (member) => propSatisfies(
        (parents) => any(
          (id) => id === root.id,
          parents
        ),
        'parents',
        member
      ),
    )
  );
  const nextBranch = without(
    [root, ...f1],
    branch
  );
  const spouses = branch.filter(
    (member) => any(
      (spouseId) => member.id === spouseId,
      (root.spouses || [])
    )
  );
  const fullSpouses = root.id === fullSpousesMemberId;
  return (
    <Flex
      width='100%'
      border='1px solid'
      borderRadius='12px'
      m='8px 2px' p='8px'
      height='max-content'
      flexDirection='column'
      minWidth='min-content'
      boxShadow='2px -1px 1px #cccccc'
      alignItems={['start', 'center']}
    >
      <Flex>
        <Box
          p='8px 4px'
          m='0 4px'
          cursor='pointer'
          maxWidth='200px'
          borderRadius='8px'
          borderColor='#d9d9d9'
          border={root.isDead ? '4px solid ' : 'unset'}
          onClick={() => openProfile({ member: root })}
          backgroundColor={(root.gender === 'MALE' ? '#def7fa' : '#fce6fc')}
        >
          <IconWithText
            styleType='column'
            text={`${root.name}`}
            subText={`${root.surname}`}
            settings={{ width: '100px', subText: { color: 'black' } }}
            icon={
              !!root.photo
                ? <Box
                  width='72px'
                  height='72px'
                  borderRadius='50%'
                  backgroundSize='cover'
                  backgroundImage={`url(${root.photo})`} />
                : 'plug'
            } />
        </Box>
        <Flex alignItems='center'>
          {
            (spouses || []).filter(
              (spouse) => spouses.length < 2 || (fullSpouses ? true : spouse.id === root.actualSpouse)
            ).map(
              (spouse, index) => (
                <Flex
                  mr='4px'
                  p='4px 2px'
                  key={index}
                  cursor='pointer'
                  borderRadius='8px'
                  width='max-content'
                  height='max-content'
                  onClick={() => openProfile({ member: spouse })}
                  borderColor='#d9d9d9'
                  border={spouse.isDead ? '4px solid ' : 'unset'}
                  backgroundColor={(spouse.gender === 'MALE' ? '#def7fa' : '#fce6fc')}
                  opacity={(spouse.id === root.actualSpouse) || (spouse.isDead || root.isDead) ? 'unset' : '50%'}
                >
                  <IconWithText
                    styleType='column'
                    text={`${spouse.name}`}
                    subText={`${spouse.surname}`}
                    icon={
                      !!spouse.photo
                        ? <Box
                          width='50px'
                          height='50px'
                          borderRadius='50%'
                          backgroundSize='cover'
                          backgroundImage={`url(${spouse.photo})`} />
                        : 'plug'
                    }
                    settings={{
                      width: '80px',
                      subText: {
                        color: 'black',
                        fontSize: '12px'
                      },
                      text: {
                        color: 'black',
                        fontSize: '12px'
                      },
                      icon: {
                        width: '50px',
                        height: '50px'
                      }
                    }} />
                </Flex>
              )
            )
          }
          {
            (spouses.length >= 2) && (
              <Button
                styleType='control'
                icon={(fullSpouses) ? 'arrowLeft' : 'arrowRight'}
                onClick={() => {
                  if (fullSpouses) {
                    return setFullSpousesMemberId('');
                  } else {
                    return setFullSpousesMemberId(root.id)
                  }
                }} />
            )
          }
        </Flex>
      </Flex>
      <Flex justifyContent='space-between'>
        {
          f1.map(
            (child, index) => <TreeBranch
              key={index}
              root={child}
              branch={nextBranch}
              openProfile={openProfile}
              fullSpousesMemberId={fullSpousesMemberId}
              setFullSpousesMemberId={setFullSpousesMemberId} />
          )
        }
      </Flex>
    </Flex>
  )
}

const Tree = () => {
  const password = '24FgDsx12a2gr';
  const [dyns, setDyns] = useState([]);
  const [curDyn, setCurDyn] = useState('');
  const [members, setMembers] = useState([]);
  const [guestMode, setGuestMode] = useState(true);
  const [rootMember, setRootMembers] = useState({});
  const [fullSpousesMemberId, setFullSpousesMemberId] = useState('');
  const { openModal, closeAllModals } = useContext(ModalContext);
  const passInLocalTrue = localStorage.getItem('matvienko-tree') === password;
  useEffect(
    () => {
      getAllDyns(setDyns)
    },
    []
  );
  useEffect(
    () => {
      if (passInLocalTrue) {
        setGuestMode(false);
      }
    },
    [passInLocalTrue]
  );
  useEffect(
    () => {
      getMembersByDyn(curDyn, setMembers)
    },
    [curDyn]
  );
  useEffect(
    () => {
      setRootMembers(members.find((member) => member.isRoot === curDyn) || {})
    },
    [members, curDyn]
  );

  const curDynName = useMemo(
    () => pathOr('', ['dynastyName'], (dyns || []).find((el) => el.id === curDyn)),
    [dyns, curDyn]
  );

  const openProfileModal = ({
    member
  }) => openModal({
    footerConfig: {
      disabled: true,
    },
    headerConfig: {
      disabled: true
    },
    settings: {
      header: {
        compact: {
          width: 'auto',
        }
      }
    },
    component: <ProfileModal
      dyns={dyns}
      curDyn={curDyn}
      member={member}
      members={members}
      selectDyn={selectDyn}
      openModal={openModal}
      guestMode={guestMode}
      setMembers={setMembers}
      closeModal={closeAllModals} />
  });

  if ((isNilOrEmpty(members) && (!isNilOrEmpty(curDyn) || isNilOrEmpty(dyns)))) return (
    <Box position='absolute' top='50%' left='45%'>
      <Loader />
    </Box>
  );

  const selectDyn = (dynId) => {
    if (passInLocalTrue) {
      setCurDyn(dynId);
      setGuestMode(false);
    } else {
      openModal({
        title: 'Введіть пароль',
        footerConfig: {
          disabled: true
        },
        settings: {
          backDrop: {
            top: '0',
            left: '0',
            height: '100%',
            width: '100vw',
            position: 'fixed',
            overflow: 'hidden',
          },
          header: {
            compact: {
              width: 'auto',
            }
          }
        },
        component: <Box>
          <Text text='Введіть пароль, щоб мати можливість редагувати дерево' />
          <Form
            text=''
            formId=''
            additionalStyles={['withoutFooter']}
            settings={{
              width: '100%',
              formContentSettings: {
                p: '0 0 36px',
                width: '100%',
              }
            }}
            validationSchema={Yup.object().shape({
              password: Yup.string().test({
                name: 'pass',
                message: 'Невірний пароль',
                test: (val) => {
                  if (val === password) {
                    closeAllModals();
                    setCurDyn(dynId);
                    setGuestMode(false);
                    localStorage.setItem('matvienko-tree', password);
                  };
                  return val === password;
                },
              })
            })}
            initialValues={{
              password: ''
            }}
            fields={[
              {
                type: 'password',
                fieldType: 'text',
                label: 'Пароль',
                input: {
                  id: 'password',
                  name: 'password',
                  placeholder: 'Введіть сюди пароль',
                }
              }
            ]}
            onSubmit={() => {
              closeAllModals();
              setCurDyn(dynId);
              setGuestMode(false);
            }}
          />
          <Text text='Або можете зайти як гість і трохи пороздивлятися' />
          <Flex m='16px 0'>
            <Button
              styleType='secondary'
              text='Зайти як гість'
              settings={{ width: '100%', }}
              onClick={() => {
                closeAllModals();
                setCurDyn(dynId);
                setGuestMode(true);
              }} />
          </Flex>
        </Box>
      })
    }
  }

  if (isNilOrEmpty(curDyn)) return (
    <Flex flexDirection='column' p='32px'>
      <Button
        styleType='secondary'
        text='Скинути введений пароль'
        onClick={() => {
          localStorage.setItem('matvienko-tree', '');
          document.location.reload()
        }} />
      <Flex mt='120px' flexDirection='column' justifyContent='center' alignItems='center'>
        <Text settings={{ color: 'red', fontSize: '48px', lineHeight: '48px' }}>ЦЕ ТЕСТОВЕ СЕРЕДОВИЩЕ!!!</Text>
        Оберіть рід
        <Flex mt='16px' flexDirection='column' alignItems='center' borderRadius='16px' border='1px solid'>
          {
            dyns.map(
              (dyn, index) => <Button
                key={index}
                styleType='secondary'
                text={dyn.dynastyName}
                settings={{ m: '16px' }}
                onClick={() => {
                  selectDyn(dyn.id);
                }} />
            )
          }
        </Flex>
      </Flex>
    </Flex>
  )

  return (
    <Flex p='0 32px 16px 8px' height='calc(98vh - 68px)' overflow='auto' mt='68px'>
      <Flex
        top='0'
        px='8px'
        left='5%'
        width='88%'
        border='1px solid'
        position='absolute'
        alignItems='center'
        height='max-content'
        borderColor='#c4c4c4'
        backgroundColor='white'
        borderRadius='0 0 16px 16px'
        justifyContent='space-between'
      >
        <Button
          icon='arrowLeft'
          text='Інший рід'
          styleType='primary'
          settings={{ bg: '#027d79' }}
          onClick={() => {
            setGuestMode(true);
            setCurDyn('');
          }} />
        <Title settings={{ border: '1px solid', bg: 'white', p: '8px', borderRadius: '8px', m: '8px' }} text={curDynName} styleType='h3' />
        <Button
          icon='plus'
          text='Додати'
          styleType='primary'
          disabled={guestMode}
          settings={{ bg: '#027d79' }}
          onClick={() => openModal({
            title: 'Створення родича',
            component: <CreateMember closeAllModals={closeAllModals} setMembers={setMembers} dyn={curDyn} members={members} />,
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
      <TreeBranch
        branch={members}
        root={rootMember}
        openProfile={openProfileModal}
        fullSpousesMemberId={fullSpousesMemberId}
        setFullSpousesMemberId={setFullSpousesMemberId} />
    </Flex>
  )

};

export default Tree;
