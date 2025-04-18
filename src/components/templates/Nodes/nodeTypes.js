import Start from '../../nodes/Start';
import Enrich from '../../nodes/Enrich';
import LeadScore from '../../nodes/LeadScore';
import Branch from '../../nodes/Branch';
import OpenAI from '../../nodes/OpenAI';
import Email from '../../nodes/Email';
import Slack from '../../nodes/Slack';

const nodeTypeArray = [
  { type: 'start', component: Start },
  { type: 'enrich', component: Enrich },
  { type: 'leadScore', component: LeadScore },
  { type: 'branch', component: Branch },
  { type: 'openAI', component: OpenAI },
  { type: 'email', component: Email },
  { type: 'slack', component: Slack },
];

 export const nodeTypes = nodeTypeArray.reduce((acc, nodeType) => {
  acc[nodeType.type] = nodeType.component;
  return acc;
}, {});
