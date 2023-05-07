import moment from 'moment';
import { db } from '../../firestore-config';
import { path, omit, flatten, uniq } from 'ramda';
import { collection, addDoc, getDocs, where, query, updateDoc, doc, getDoc } from "firebase/firestore";

const getAllDyns = async (setDyns) => {
  try {
    const dynsSnap = await getDocs(collection(db, 'dynasties'));
    const dyns = dynsSnap.docs.map(
      dyn => ({
        ...dyn.data(),
        id: dyn.id,
      })
    );
    return setDyns(dyns);
  } catch (err) {
    console.log(err);
  }
}

const getMembersByDyn = async (dyn, callback) => {
  try {
    const membersSnap = await getDocs(query(collection(db, 'members'), where('dynastyIds', 'array-contains', dyn)));
    const members = membersSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }));
    const spousesIds = members.reduce(
      (acc, cur) => {
        if (path(['spouses'], cur)) {
          return [
            ...acc,
            ...path(['spouses'], cur)
          ]
        } else {
          return acc;
        }
      },
      []
    );
    const spouses = await Promise.all(spousesIds.map(
      async (id) => {
        const spouseRef = doc(db, 'members', id);
        const spouse = await getDoc(spouseRef);
        return {
          ...spouse.data(),
          id,
        }
      }
    ))
    if (!!callback) {
      callback([
        ...members,
        ...spouses,
      ])
    }
    return ([
      ...members,
      ...spouses,
    ]);
  } catch (err) {
    console.log(err)
  }
}

const updateDocById = async (id, data) => {
  try {
    const memberRef = doc(db, 'members', id);
    const updatedMember = await updateDoc(memberRef, data);
    return updatedMember;
  } catch (err) {
    console.log(err)
  }
}

const editMemberById = async ({
  id,
  dyn,
  data,
  callback,
  onSuccess,
}) => {
  try {
    const isDead = data.deathStatus === 'dead'
    const dataToUpdate = {
      isDead,
      name: data.name,
      gender: data.gender,
      surname: data.surname,
      fathersName: data.fathersName,
      dob: moment(data.dob, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      dod: isDead ? moment(data.dod, 'YYYY-MM-DD').format('DD.MM.YYYY') : '',
    };
    return await updateDocById(id, dataToUpdate)
      .then(() => getMembersByDyn(dyn))
      .then((data) => !!callback && callback(data))
      .then((data) => !!onSuccess && onSuccess(data));
  } catch (err) {
    console.log(err)
  }
}

const getMemberById = async (id, callback) => {
  try {
    const memberRef = doc(db, 'members', id);
    const member = await getDoc(memberRef);
    const dataToSave = {
      ...member.data(),
      id: member.id
    };
    if (!!callback) { callback(dataToSave); }
    return dataToSave;
  } catch (err) {
    console.log(err)
  }
}

const addMember = async (newMember) => {
  try {
    const docRef = await addDoc(collection(db, 'members'), newMember);
    return docRef;
  } catch (err) {
    console.log(err)
  }
};

const createMember = async ({
  dyn,
  data,
  callback,
  onSuccess,
}) => {
  try {
    const memberInit = omit(['sibling', 'siblingType', 'deathStatus', 'isActual', 'childrenWithSpouse'], data);
    const parents = data.siblingType === 'parent' ? [data.sibling] : [];
    const spouse = data.siblingType === 'spouse' ? data.sibling : null;
    const child = data.siblingType === 'child' ? data.sibling : null;
    const memberToSave = {
      ...memberInit,
      parents,
      isRoot: !!child ? dyn : '',
      spouses: !!spouse ? [spouse] : [],
      isDead: data.deathStatus === 'dead',
      dynastyIds: data.siblingType === 'spouse' ? [] : [dyn],
      dob: moment(data.dob, 'YYYY-MM-DD').format('DD.MM.YYYY'),
      actualSpouse: (data.siblingType === 'spouse' && data.isActual) ? data.sibling : '',
      dod: data.deathStatus === 'dead' ? moment(data.dob, 'YYYY-MM-DD').format('DD.MM.YYYY') : '',
    };
    const docRef = await addMember(memberToSave).then(async ref => {
      if (!!spouse) {
        if (data.childrenWithSpouse.length >= 1) {
          await Promise.all(data.childrenWithSpouse.map(
            async ({ value }) => {
              await getMemberById(value).then(
                async (child) => await updateDocById(value, {
                  parents: [
                    ...child.parents,
                    ref.id
                  ]
                })
              )
            }
          ))
        }
        await getMemberById(spouse).then(async (siblingData) => {
          if (!!siblingData.actualSpouse) {
            await updateDocById(siblingData.actualSpouse, {
              actualSpouse: ''
            });
          }
          await updateDocById(spouse, {
            actualSpouse: data.isActual ? ref.id : '',
            spouses: [
              ...siblingData.spouses,
              ref.id
            ],
          });
        })
      } else if (!!child) {
        await getMemberById(child).then(async (siblingData) => {
          const parentsToSave = [
            ...(siblingData.parents || []),
            ref.id
          ];
          if (siblingData.isRoot) {
            await updateDocById(child, {
              isRoot: '',
              parents: parentsToSave,
            })
          }
        })
      }
      return ref;
    });
    await getMembersByDyn(dyn).then((data) => !!callback && callback(data)).then((data) => !!onSuccess && onSuccess(data));
    return ({
      ...docRef,
      id: docRef.id
    })
  } catch (err) {
    console.log(err)
  }
}

const setProfilePhoto = async ({
  photo,
  curDyn,
  memberId,
  setMembers,
  setCurMember,
}) => {
  console.log({
    photo,
    curDyn,
    memberId,
    setMembers,
  })
  try {
    const memberRef = doc(db, 'members', memberId);
    await updateDoc(memberRef, {
      photo
    }).then(async () => {
      await getMembersByDyn(curDyn, setMembers);
      await getMemberById(memberId, setCurMember);
    })
  } catch (err) {
    console.log(err);
  }
}

const fixSpouses = async () => {
  try {
    const members = await getMembersByDyn('00001');
    const membersIsActual = members.filter((member) => member.isActual)
    const membersToSave = membersIsActual.map(async (member) => {
      const actualSpouse = member.spouses.find((spouse) => (
        members.find(({ id }) => spouse === id).isActual
      ))
      return await updateDocById(member.id, {
        ...omit(['isActual'], member),
        actualSpouse,
      })
    })
    Promise.all(membersToSave);
    return 'yes'
  } catch (err) {
    console.log(err)
  }
}

const findAllDescendants = ({
  root,
  branch,
}) => {
  const f1 = branch.filter((member) => member.parents.some((parent) => parent === root.id));
  if (f1.length === 0) return root;
  const result = f1.map((child) => findAllDescendants({
    branch,
    root: child,
  }))
  return uniq(flatten([
    ...result,
    f1,
  ]));
}

const createNewDynForMember = async ({
  member,
  members,
  onSuccess,
  dynastyName,
}) => {
  const allMembersIdToUpdate = findAllDescendants({
    root: member,
    branch: members
  })
  console.log("🚀 ~ file: index.js:264 ~ allMembersIdToUpdate", allMembersIdToUpdate)
  const { id: dynId } = await addDoc(collection(db, 'dynasties'), {
    dynastyName
  });
  const updatedMembers = allMembersIdToUpdate.length >= 1 ? allMembersIdToUpdate.map(
    async (member) => await getMemberById(member.id).then(
      (async item => await updateDocById(item.id, {
        dynastyIds: [
          ...item.dynastyIds,
          dynId
        ],
      }))
    )
  ) : [];
  await getMemberById(member.id).then(async (item) => {
    await updateDocById(item.id, {
      isRoot: dynId,
      dynastyIds: [
        ...item.dynastyIds,
        dynId
      ]
    })
  })

  if (!!onSuccess) {
    onSuccess();
  }
  return updatedMembers;
}

export {
  addMember,
  fixSpouses,
  getAllDyns,
  createMember,
  updateDocById,
  getMemberById,
  editMemberById,
  getMembersByDyn,
  setProfilePhoto,
  createNewDynForMember,
};
