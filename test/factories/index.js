const { Factory } = require('rosie');


// import { Factory } from 'rosie'
// import TargetAudience from '../../../src/Domain/Portal/Entities/Campaign/TargetAudience'
// import AudienceType from '../../../src/Domain/Portal/Entities/Campaign/AudienceType'
// import * as faker from 'faker'

// export default function (): void {
//     Factory.define<TargetAudience>('TargetAudience')
//         .attr('districtId', faker.random.number(5) + 1)
//         .attr('schoolId',   faker.random.number(5) + 1)
//         .attr('ncesId', faker.random.uuid)
//         .attr('name', faker.random.word())
//         .attr('audienceType', AudienceType.DistrictStaff)
// }


// const Car = 
// export default {
//     Factory
//         .define('DistrictSetupProgress')
//         .attr('ncesDistrictId', () => faker.random.number({ min: 1000000, max: 9999999 }).toString())
//         .attr('status', DistrictSetupStatuses.InProgress)
//         .attr('schoolsActivated', TaskStatuses.Pending)
//         .attr('schoolsActivatedAt', null)
//         .attr('staffLoaded', TaskStatuses.Pending)
//         .attr('staffLoadedAt', null)
//         .attr('staffEmailed', TaskStatuses.Pending)
//         .attr('staffEmailedAt', null)
//         .attr('parentsLoaded', TaskStatuses.Pending)
//         .attr('parentsLoadedAt', null)
//         .attr('siteLinked', VisitableTaskStatuses.Pending)
//         .attr('siteLinkedAt', null)
//         .attr('staffTrained', VisitableTaskStatuses.Pending)
//         .attr('staffTrainedAt', null)
//         .attr('orgsEmailed', VisitableTaskStatuses.Pending)
//         .attr('orgsEmailedAt', null)
//         .attr('parentsEmailed', VisitableTaskStatuses.Pending)
//         .attr('parentsEmailedAt', null)
//         .attr('createdAt', () => faker.date.recent(2))
//         .attr('updatedAt', () => faker.date.recent(2))

// import targetAudience from './Portal/TargetAudience'
// type FactoryRegistration = () => void

// const registrations: FactoryRegistration[] = [
//     schoolOrDistrictRegistration,
//     schoolOrDistrictOnboardingPrice,
//     districtSetupProgress,
//     ncesDistrict,
//     ncesSchool,
//     signedDocument,
//     signedDocumentTemplate,
//     signedDocumentSigner,
//     docusignSigner,
//     subjectPasswordIdentity,
//     payment,
//     price,
//     discount,
//     districtInfo,
//     geocoreFlyerApprover,
//     geocoreFlyerDistrictPage,
//     identity,
//     flyer,
//     flyerImageUrls,
//     flyerImageParams,
//     flyerSchoolList,
//     flyerApprovalSlot,
//     flyerApprovalStatusUpdateResult,
//     deliverySetting,
//     targetAudience
// ]

// registrations.forEach(register => register())

// export default Factory
