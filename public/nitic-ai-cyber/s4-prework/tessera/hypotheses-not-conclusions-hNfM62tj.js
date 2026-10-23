import{B as e,C as t,R as n,T as r,X as i,_ as a}from"./index-kuk8hWpZ.js";import"./legacy-BU_6878h.js";import{t as o}from"./Signal-DjqUw2bD.js";import{t as s}from"./scrollable-DnojeHss.js";var c={title:`Hypotheses, Not Conclusions`},l=r(`<pre class="s1-wrap">Output (web-server log export, test site, 19:02 local):
GET /search?q=history    200
GET /search?q=o%27brien  500
GET /search?q=obrien     200

Scope: read-only review of this log export and authenticated browsing of the test
site with the supplied account. Any test that changes data needs written approval.

List two to four hypotheses for the 500 response, most likely first. For each one,
state the evidence that would confirm or rule it out and the least invasive next
step that stays inside this scope. Mark anything you cannot tell from the output.</pre> <p>A useful answer ranks three hypotheses: the input reaches a database query unescaped, the search component fails on punctuation without touching a database, or the error was a one-time failure. It suggests repeating the identical search once and reading the server error log, because both steps are read-only and inside scope. It marks the first hypothesis as unconfirmed.</p>`,1),u=r(`<p>The common error asks a model for the answer and treats its first explanation as the finding. A single explanation hides the alternatives, so the tester never gathers the evidence that would separate them.</p>`),d=r(`<h1>Hypotheses, Not Conclusions</h1> <p>A <strong>hypothesis</strong> is a candidate explanation that names the evidence that would confirm or rule it out.
  A conclusion ends the inquiry.
  A hypothesis directs the next safe step.</p> <p>An AI request about raw output is useful when it asks for hypotheses rather than a verdict.
  A request that asks “what is wrong with this server” invites one confident answer.
  A request that asks for ranked hypotheses, the evidence each one needs, and a safe next step produces a plan the tester can check against the authorization.</p> <p>A strong request has four parts:</p> <ol><li>The raw output, pasted unedited, with the tool and the time.</li> <li>The scope, so the model knows which next steps are allowed.</li> <li>A request for two to four hypotheses, ranked from most to least likely.</li> <li>For each hypothesis, the evidence that would confirm or rule it out, and the least invasive next step that would gather it.</li></ol> <!> <p>The tester then checks each suggested step against the authorization before taking it.
  A model suggestion is a proposal, never an approval.
  Any step that would change data or reach beyond the target waits, whatever confidence the model expresses.</p> <!>`,1);function f(r){var c=d(),f=e(n(c),10);o(f,{kind:`worked`,title:`A hypothesis request for the search error`,children:(e,r)=>{var o=l(),c=n(o);a(c,e=>s?.(e)),i(2),t(e,o)},$$slots:{default:!0}});var p=e(f,4);o(p,{kind:`mistake`,children:(e,n)=>{var r=u();t(e,r)},$$slots:{default:!0}}),t(r,c)}export{f as default,c as pageConfig};