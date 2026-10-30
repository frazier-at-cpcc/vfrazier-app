import{B as e,E as t,O as n,R as r}from"./index-BRNq7qF2.js";import"./legacy-tH0EGqxk.js";import{t as i}from"./LessonVideo-Dpf42kiu.js";import{t as a}from"./Signal-C94j4DPj.js";var o=`Classifying Data Before It Reaches a Model

[0:02.0] Before you paste
Before anything goes into an AI tool, tier it. There are four tiers, and the highest one in your input decides where it can go.

[0:10.2] The four tiers
Public is approved for public release, like the course catalog. Internal is routine business with low harm if exposed, like budget meeting notes. Confidential means exposure would harm people or operations, like a firewall log. Restricted is protected by law, regulation, or contract.

[0:31.6] Restricted: name the law
For Restricted, name the law. A class roster with IDs and grades is an education record, so FERPA. A financial aid appeal is FERPA plus the GLBA Safeguards Rule.

[0:42.7] The decision rule
Now the rule. Paste meeting notes with the roster underneath, and the highest tier is Restricted, so the whole input is Restricted. Consumer chatbot: no. Licensed enterprise tool: not by default. Managed campus server: only de-identified, logged, with set retention. Unmanaged laptop: no.

[1:03.6] Do now
Pause here. Tier the reported phishing email. Then name the highest tier in a paste that mixes the catalog entry with a financial aid appeal.
`,s={title:`The Four Data Tiers`},c=n(`<p>The retention table reports percentages by program, with no student names.
    Two programs have 4 and 9 students, and the table also reports the share of each program receiving Pell grants.
    A percentage over four people identifies them.
    "Aggregate" is not the same as "anonymous."
    A team that places the table in Confidential and says why has understood de-identification better than a team that places it in Internal because it has "no names."</p>`),l=n(`<p>A common error marks an item Restricted without naming the law.
    Restricted means protected by law, regulation, or contract, so the label is incomplete until the law is named.</p>`),u=n(`<h1>The Four Data Tiers</h1> <p>A four-tier scheme gives every item one label that decides where it may go.
  The tiers rise with the harm of exposure, and the top tier always names the law that protects the data.</p> <div class="s1-table-wrap"><table class="s1-table"><caption>Four tiers with Northbridge examples</caption><thead><tr><th scope="col">Tier</th><th scope="col">Definition</th><th scope="col">Northbridge examples</th></tr></thead><tbody><tr><th scope="row">Public</th><td>Approved for public release</td><td>The published catalog entry for CYB 110</td></tr><tr><th scope="row">Internal</th><td>Routine business information, with low harm if exposed</td><td>The department's budget meeting record, and the retention summary by program, which is defensibly Confidential</td></tr><tr><th scope="row">Confidential</th><td>Exposure would harm people or operations</td><td>The reported phishing email, and the firewall log excerpt</td></tr><tr><th scope="row">Restricted</th><td>Protected by law, regulation, or contract. Name the law.</td><td>The class roster with IDs and grades, under FERPA, and the financial aid appeal, under GLBA and FERPA</td></tr></tbody></table></div> <!> <!> <p>Some items belong to more than one law, and some to none.
  An accommodation column on a roster is an education record under FERPA, and it also discloses a disability.
  A firewall log falls under no specific law, yet it maps internal addressing and hostnames that an attacker would value, which makes it Confidential.</p> <!>`,1);function d(n){var s=u(),d=e(r(s),6);i(d,{src:`$assets/video/four-data-tiers.mp4`,title:`Classifying Data Before It Reaches a Model`,tracks:[{src:`$assets/video/four-data-tiers.vtt`,kind:`captions`,srclang:`en`,label:`English`}],get transcript(){return o}});var f=e(d,2);a(f,{kind:`worked`,title:`Where teams disagree: the retention summary`,children:(e,n)=>{var r=c();t(e,r)},$$slots:{default:!0}});var p=e(f,4);a(p,{kind:`mistake`,children:(e,n)=>{var r=l();t(e,r)},$$slots:{default:!0}}),t(n,s)}export{d as default,s as pageConfig};