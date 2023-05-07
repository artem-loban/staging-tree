import * as Yup from 'yup';
import moment from 'moment';
import React, { useState } from 'react';
import { Box, Flex, Form, Loader } from 'exsportia-components';
import { createMember, editMemberById } from '../../functions/firestore';

const initialValues = (editMode, editedMember) => editMode ? {
  sibling: '',
  siblingType: '',
  name: editedMember.name,
  gender: editedMember.gender,
  surname: editedMember.surname,
  fathersName: editedMember.fathersName,
  deathStatus: !!editedMember.isDead ? 'dead' : 'alive',
  dob: moment(editedMember.dob, 'DD.MM.YYYY').format('YYYY-MM-DD'),
  dod: moment(editedMember.dod, 'DD.MM.YYYY').format('YYYY-MM-DD'),
} : {
  dob: '',
  dod: '',
  name: '',
  surname: '',
  sibling: '',
  gender: 'MALE',
  fathersName: '',
  deathStatus: 'alive',
  siblingType: 'parent',
  childrenWithSpouse: [],
}

export const CreateMember = ({
  dyn,
  members,
  setMembers,
  closeAllModals,
  editMode = false,
  editedMember = {}
}) => {
  const [sex, setSex] = useState('MALE');
  const [isDead, setIsDead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [siblingType, setSiblingType] = useState(null);
  const [selectedSibling, setSelectedSibling] = useState(null);

  if (isLoading) return <Box position='absolute' top='50%' left='45%'>
    <Loader />
  </Box>
  return <Flex pb={['48px', '32px']}>
    <Form
      text=''
      initialValues={initialValues(editMode, editedMember)}
      onSubmit={(values) => {
        setIsLoading(true)
        if (editMode) {
          editMemberById({
            dyn,
            data: values,
            id: editedMember.id,
            callback: setMembers,
            onSuccess: closeAllModals,
          })
        } else {
          createMember({
            dyn,
            data: values,
            callback: setMembers,
            onSuccess: closeAllModals,
          });
        }
        setMembers([])
      }}
      settings={{
        width: '100%',
        formContentSettings: {
          width: '100%'
        },
        footer: {
          buttons: {
            submitButton: {
              text: 'Зберегти',
              styleType: 'secondary',
            },
            cancelButton: {
              text: 'Відмінити',
              styleType: 'link',
              onClick: closeAllModals,
            }
          }
        }
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(`Введіть ім'я`),
        surname: Yup.string().required(`Введіть прізвище`),
        fathersName: Yup.string().required(`Введіть по-батькові`),
        dob: Yup.string().required(`Введіть дату народження`),
        dod: Yup.string().when('deathStatus', {
          is: 'dead',
          otherwise: Yup.string(),
          then: Yup.string().required(`Введіть дату смерті`),
        }),
        sibling: Yup.string().when('name', {
          is: () => !editMode,
          otherwise: Yup.string(),
          then: Yup.string().required('Виберіть родича'),
        })
      })}
      fields={[
        {
          label: `Прізвище`,
          fieldType: 'text',
          input: {
            id: 'surname',
            name: 'surname',
            placeholder: `Введіть сюди прізвище`
          }
        },
        {
          label: `Ім'я`,
          fieldType: 'text',
          input: {
            id: 'name',
            name: 'name',
            placeholder: `Введіть сюди ім'я`,
          }
        },
        {
          label: `По-батькові`,
          fieldType: 'text',
          input: {
            id: 'fathersName',
            name: 'fathersName',
            placeholder: `Введіть сюди по-батькові`
          }
        },
        {
          label: 'Стать',
          fieldType: 'selectInput',
          handleSetFieldValue: ({ value, setValues, values}) => {
            setSex(value);
            setValues({
              ...values,
              gender: value
            })
          },
          options: [
            {
              value: 'MALE',
              label: 'Чоловік',
            },
            {
              label: 'Жінка',
              value: 'FEMALE',
              isDisabled: siblingType === 'parent',
            },
          ],
          input: {
            id: 'gender',
            name: 'gender',
          }
        },
        {
          type: 'date',
          fieldType: 'text',
          label: 'Дата народження',
          input: {
            id: 'dob',
            name: 'dob',
          }
        },
        {
          fieldType: 'selectInput',
          label: 'Чи ще живий цей родич?',
          handleSetFieldValue: ({ value, values, setValues }) => {
            setIsDead(value === 'dead');
            setValues({
              ...values,
              deathStatus: value
            })
          },
          options: [
            {
              value: 'alive',
              label: 'Живий',
            },
            {
              value: 'dead',
              label: 'Неживий',
            }
          ],
          input: {
            id: 'deathStatus',
            name: 'deathStatus',
          }
        },
        {
          type: 'date',
          fieldType: 'text',
          label: 'Дата смерті',
          isRender: ({ deathStatus }) => deathStatus === 'dead',
          input: {
            id: 'dod',
            name: 'dod'
          }
        },
        {
          showDivider: true,
          isRender: () => !editMode,
          fieldType: 'selectInput',
          label: `Близький родич із роду`,
          handleSetFieldValue: ({ value, setValues, values }) => {
            setValues({
              ...values,
              sibling: value
            });
            setSelectedSibling(value);
          },
          text: 'Додайте родича з уже наявних в роді',
          options: members.filter(
            member => siblingType === 'child'
              ? member.isRoot
              : true
          ).filter(
            (member) => member.dynastyIds.some(id => id === dyn)
          ).map(member => ({
            value: member.id,
            label: `${member.surname} ${member.name} ${member.fathersName}`
          })),
          input: {
            id: `sibling`,
            name: 'sibling',
          }
        },
        {
          fieldType: 'selectInput',
          isRender: () => !editMode,
          label: `Ким він є для створюваного родича?`,
          text: 'Увага! Опцію "Дитина" можна вибрати тільки для родичів без зареєстрованих батьків. В іншому випадку скористайтесь опцією "Чоловік або дружина"',
          handleSetFieldValue: ({ value, setValues, values }) => {
            setSiblingType(value);
            setValues({
              ...values,
              siblingType: value,
            });
          },
          input: {
            id: `siblingType`,
            name: 'siblingType',
          },
          options: [
            {
              value: 'parent',
              label: 'Батько',
              isDisabled: sex === 'FEMALE',
            },
            {
              value: 'child',
              label: 'Дитина',
              isDisabled: !selectedSibling
                ? false
                : !members.find((member) => !!member.parents && member.parents.length === 0),
            },
            {
              value: 'spouse',
              label: 'Чоловік чи дружина'
            }
          ],
        },
        {
          label: 'Діти в шлюбі',
          fieldType: 'selectInput',
          isRender: ({ siblingType }) => (siblingType === 'spouse') && !!!editMode,
          options: members.filter(
            ({ parents }) => parents.some(id => id === selectedSibling)
          ).map(
            ({ name, surname, fathersName, id }) => ({
              value: id,
              label: `${surname} ${name} ${fathersName}`,
            })
          ),
          input: {
            isMulti: true,
            id: 'childrenWithSpouse',
            name: 'childrenWithSpouse',
            placeholder: 'Виберіть усіх дітей в цьому шлюбі',
          }
        },
        {
          fieldType: 'toggle',
          label: 'Зараз в шлюбі?',
          isRender: ({ siblingType }) => (siblingType === 'spouse') && !isDead,
          input: {
            onText: 'Так',
            offText: 'Ні',
            id: 'isActual',
            name: 'isActual',
            styleType: 'default',
          }
        },
        {
          fieldType: 'text',
          label: 'Введіть дівоче прізвище, якщо відрізняється',
          isRender: ({ gender, siblingType }) => (gender === 'FEMALE') && (siblingType === 'spouse'),
          input: {
            id: 'maidenName',
            name: 'maidenName',
          }
        },
      ]}
    />
  </Flex>
}

export const EditMember = ({
  dyn,
  member,
  members,
  setMembers,
  closeAllModals,
}) => <CreateMember closeAllModals={closeAllModals} setMembers={setMembers} dyn={dyn} members={members} editMode={true} editedMember={member} />;

export default CreateMember;
