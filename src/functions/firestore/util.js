// const saveFamily = ({
//   dyn,
//   branch,
//   parents,
//   isNotSpouse,
// }) => {
//   branch.forEach((el) => {
//     const newMember = {
//       ...omit(['spouses', 'childrenWith'], el),
//       dynastyIds: isNotSpouse ? dyn : [],
//       parents: isNotSpouse ? parents : [],
//     };
//     addMember(newMember).then(
//       (member) => {
//         const uid = path(['id'], member)
//         console.log(newMember);
//         if (isNilOrEmpty(el.spouses) && isNilOrEmpty(el.childrenWith)) {
//           return;
//         } else {
//           return saveFamily({
//             dyn,
//             branch: el.spouses || el.childrenWith,
//             isNotSpouse: !isNilOrEmpty(el.childrenWith),
//             parents: isNotSpouse ? [uid] : [...parents, uid],
//           })
//         }
//       }
//     )
//   })
// }

// const updateSpouses = (members) => {
//   try {
//     members.map(
//       async member => {
//         const parents = member.parents
//         if (!isNilOrEmpty(parents)) {
//           await Promise.all(parents.map(
//             (curParent) => without(curParent, parents).map(
//               async id => updateDocById(id, { spouses: [curParent] })
//             )
//           ))
//         }
//         return members;
//       }
//     )
//   } catch (err) {
//     console.log(err);
//   }
// }