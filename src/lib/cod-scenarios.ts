/**
 * COD confirmation-call practice scenarios.
 *
 * All dialogue is stored as {en, hinglish} pairs: English is the default so
 * every Indian seller can play regardless of Hindi fluency; Hinglish is one
 * tap away for the realism of how these calls often sound in the Hindi belt.
 * Hints, debriefs and takeaways are coaching text and stay English-only.
 */
export type Localized = { en: string; hinglish: string };
export type ScenarioLanguage = keyof Localized;

export type ReplyOption = {
  text: Localized;
  quality: "best" | "ok" | "bad";
  points: number;
  reaction: Localized;
};

export type Turn = {
  customerMessage: Localized;
  hint?: string;
  options: ReplyOption[];
};

export type Scenario = {
  id: string;
  title: Localized;
  rtoCause: string;
  difficulty: 1 | 2 | 3;
  orderValue: number;
  shippingCost: number;
  product: string;
  context: string;
  turns: Turn[];
  shipThreshold: number;
  shipDebrief: string;
  returnDebrief: string;
  keyTakeaway: string;
};

export const COD_SCENARIOS: Scenario[] = [
  {
    id: "vague-address",
    title: { en: "The vague address", hinglish: "The vague address" },
    rtoCause: "Incomplete / wrong address",
    difficulty: 1,
    orderValue: 699,
    shippingCost: 65,
    product: "Phone case (transparent, slim fit)",
    context:
      "Customer ordered a ₹699 phone case COD. Address given: \"Near Shiv Temple, Sector 7, Noida.\" No flat number, no landmark, no alternate phone. Delivery will fail without better details.",
    turns: [
      {
        customerMessage: {
          en: "Yes, I placed the order - the phone case one.",
          hinglish: "Haan bhai, order kiya hai maine. Phone case wala.",
        },
        hint: "Address is incomplete - you need a flat number and landmark",
        options: [
          {
            text: {
              en: "Sir, delivery will go smoothly if you share your flat number and a nearby landmark. Do you have an alternate phone number too?",
              hinglish:
                "Sir, delivery smooth hoga agar aap flat number aur nearby landmark bata dein. Koi alternate phone number bhi hai?",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Hmm yes, it's Flat 302, Sunshine Apartments - the lane opposite the temple. Should I give my wife's number? 98XXXXXXXX.",
              hinglish:
                "Hmm haan, Flat 302, Sunshine Apartments hai. Temple ke saamne wali gali. Wife ka number de doon? 98XXXXXXXX.",
            },
          },
          {
            text: {
              en: "Sir, just confirming your address - Near Shiv Temple, Sector 7, Noida - is that right?",
              hinglish:
                "Sir, aapka address confirm kar raha hoon - Near Shiv Temple, Sector 7, Noida - sahi hai?",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "Yes that's right... though Sector 7 has a lot of temples. It's Sunshine Apartments, actually.",
              hinglish:
                "Haan sahi hai... waise Sector 7 mein bahut temples hain. Sunshine Apartments hai actually.",
            },
          },
          {
            text: {
              en: "Sir, your address is incomplete. Give the full address or the order will be cancelled.",
              hinglish:
                "Sir address incomplete hai, full address do warna cancel ho jayega.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "What do you mean cancelled? I placed the order, it's your job to deliver it. Forget it, just cancel.",
              hinglish:
                "Kya matlab cancel? Maine order kiya hai, tum deliver karo na. Rehne do, cancel kar do.",
            },
          },
        ],
      },
      {
        customerMessage: {
          en: "So when will it arrive? I need it by tomorrow.",
          hinglish: "Toh kab tak aayega? Kal chahiye mujhe.",
        },
        hint: "Confirm timeline and cash amount - reduce uncertainty",
        options: [
          {
            text: {
              en: "Sir, it will be delivered by tomorrow afternoon. Please keep ₹699 cash ready. I'll also WhatsApp you the tracking as soon as it's dispatched.",
              hinglish:
                "Sir, kal afternoon tak deliver hoga. ₹699 cash ready rakhiyega. Main dispatch hone pe WhatsApp pe tracking bhi bhej dunga.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Alright, done. I'll keep the cash. Send me the WhatsApp.",
              hinglish: "Theek hai bhai, done. Cash rakh lunga. WhatsApp kar dena.",
            },
          },
          {
            text: {
              en: "It'll reach you by tomorrow, sir.",
              hinglish: "Kal tak ho jayega sir.",
            },
            quality: "ok",
            points: 1,
            reaction: { en: "Ok.", hinglish: "Ok." },
          },
          {
            text: {
              en: "Sir, the delivery timeline depends on the system, I can't tell you exactly.",
              hinglish:
                "Sir delivery timeline system pe depend karta hai, exact nahi bata sakta.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "You people can never be trusted. If it doesn't come, I'm cancelling.",
              hinglish:
                "Yaar tum logon ka koi bharosa nahi, agar nahi aaya toh cancel.",
            },
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You got the full address, alternate contact, and confirmed the cash amount with a delivery window. The customer feels informed and committed. This order ships and delivers successfully.",
    returnDebrief:
      "Without a proper address, the delivery boy circled Sector 7 for 20 minutes, couldn't find the customer, and the package came back. You paid ₹130 in round-trip shipping for nothing.",
    keyTakeaway:
      "Always get: flat/house number, landmark, alternate phone. A 30-second call saves ₹60-130 in RTO shipping.",
  },

  {
    id: "impulse-regret",
    title: { en: "The 2 AM impulse buy", hinglish: "The 2 AM impulse buy" },
    rtoCause: "Buyer's remorse / impulse order",
    difficulty: 2,
    orderValue: 1299,
    shippingCost: 75,
    product: "Fitness tracker (budget smart band)",
    context:
      "Customer ordered a ₹1,299 fitness tracker at 2:14 AM. It's now 10 AM and you're calling to confirm. Their voice sounds hesitant - classic impulse regret pattern.",
    turns: [
      {
        customerMessage: {
          en: "Hmm... yes I did order it... actually I'm still deciding whether I want it or not.",
          hinglish:
            "Hmm... haan maine order kiya tha... actually soch raha hoon chahiye ya nahi.",
        },
        hint: "Don't pressure - reduce friction and risk perception",
        options: [
          {
            text: {
              en: "No stress at all, sir. Delivery is day after tomorrow - have a look when it arrives. If you don't like it there's a 7-day free return, no questions asked. I'm just confirming your address.",
              hinglish:
                "Sir, koi stress nahi. Delivery parson aayegi. Dekhiyega, pasand nahi aaya toh 7-day free return hai - no questions. Bas address confirm kar raha hoon.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Oh, the return is free? Ok fine, send it then. Let's see.",
              hinglish:
                "Accha, return free hai? Ok theek hai, aane do fir. Dekhte hain.",
            },
          },
          {
            text: {
              en: "Sir, the order is confirmed. If you want to cancel, tell me now.",
              hinglish: "Sir order confirm hai. Cancel karna hai toh abhi bataiye.",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "Hmm... no, leave it, let it come. We'll see.",
              hinglish: "Hmm... nahi rehne do, aane do. Dekhte hain.",
            },
          },
          {
            text: {
              en: "Sir, the order is already placed - it can't be cancelled in the system now.",
              hinglish: "Sir order ho gaya hai, ab system mein cancel nahi hoga.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "What? It can't be cancelled? Then I don't want it at all - I'll refuse it at delivery.",
              hinglish:
                "Kya? Cancel nahi hoga? Toh main lena hi nahi chahta, delivery ke time refuse kar dunga.",
            },
          },
        ],
      },
      {
        customerMessage: {
          en: "Tell me one thing - this is original, right? I can see the same one on Amazon for ₹899.",
          hinglish:
            "Ek baat batao - ye original hai na? Amazon pe same ₹899 mein dikh raha hai.",
        },
        hint: "Validate the concern, add value beyond price",
        options: [
          {
            text: {
              en: "Sir, it's 100% original with a warranty card. The one on Amazon is the older model without the heart-rate sensor. Yours is the latest version with SpO2 too. Plus we offer COD - pay only when you see the product.",
              hinglish:
                "Sir, 100% original hai with warranty card. Amazon pe wo purana model hai bina heart rate sensor ke. Aapka wala latest version hai with SpO2 bhi. Plus humare yahan COD hai - pay only when you see the product.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Oh, it has SpO2 too? Ok, send it. Can you deliver to my office? I need to change the address.",
              hinglish:
                "Accha, SpO2 bhi hai? Ok bhai, bhej do. Office pe bhijwa sakte ho? Address change karna hai.",
            },
          },
          {
            text: {
              en: "Sir, our product is original - you can compare for yourself.",
              hinglish:
                "Sir humaara product original hai, aap compare kar sakte hain.",
            },
            quality: "ok",
            points: 1,
            reaction: { en: "Hmm ok. Send it then.", hinglish: "Hmm ok. Bhej do fir." },
          },
          {
            text: {
              en: "Sir, don't compare prices - our quality is different.",
              hinglish: "Sir price compare mat karo, humaara quality different hai.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "If the quality is different then prove it. Forget it, cancel the order.",
              hinglish:
                "Bhai quality different hai toh prove karo na. Rehne do, cancel karo.",
            },
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You de-risked the purchase with the return policy and justified the price with product knowledge. The customer shifted from \"do I want this\" to \"where should I get it delivered\" - that's a converted order.",
    returnDebrief:
      "The customer was already on the fence. Without de-risking, they'll refuse at the door - classic RTO. You eat ₹150 in round-trip shipping plus the product may come back damaged.",
    keyTakeaway:
      "For impulse orders: (1) never pressure, (2) lead with the return policy to reduce risk, (3) justify the price gap if they comparison-shop.",
  },

  {
    id: "cash-not-ready",
    title: { en: "\"No cash right now\"", hinglish: "\"Cash nahi hai abhi\"" },
    rtoCause: "Cash not available at delivery",
    difficulty: 2,
    orderValue: 1899,
    shippingCost: 85,
    product: "Electric chopper (kitchen appliance)",
    context:
      "Customer ordered a ₹1,899 kitchen chopper COD. You call to confirm. She's interested but says she doesn't have cash right now - husband brings cash in the evening.",
    turns: [
      {
        customerMessage: {
          en: "Yes, I placed the order, but I don't have cash right now. My husband will bring some in the evening.",
          hinglish:
            "Haan maine order kiya hai, lekin abhi mere paas cash nahi hai. Husband evening mein laayenge.",
        },
        hint: "Offer flexibility - don't force immediate delivery",
        options: [
          {
            text: {
              en: "No problem at all, ma'am. When would be convenient? I can schedule the evening slot - would 5 to 7 PM work?",
              hinglish:
                "Koi baat nahi ma'am. Kab convenient hoga? Main evening slot mein schedule kar deta hoon - 5 se 7 PM chalega?",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Yes, after 6 works. My husband will be home by then too.",
              hinglish:
                "Haan 6 baje ke baad theek rahega. Husband bhi ghar honge tab.",
            },
          },
          {
            text: {
              en: "Ma'am, please keep the cash ready - you'll have to pay when the delivery boy arrives.",
              hinglish:
                "Ma'am cash rakh lijiye, delivery boy aayega tab dena padega.",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "Hmm ok, I'll try to withdraw from the ATM.",
              hinglish: "Hmm theek hai, try karungi ATM se nikaalne ki.",
            },
          },
          {
            text: {
              en: "Ma'am, it's COD so the cash has to be ready. Should I cancel it?",
              hinglish:
                "Ma'am COD hai toh cash ready hona chahiye. Cancel kar dein?",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "Why cancel? I want it, I just don't have cash this minute. Forget it then, cancel it.",
              hinglish:
                "Cancel kyu? Main lena chahti hoon, bas abhi cash nahi hai. Rehne do fir, cancel karo.",
            },
          },
        ],
      },
      {
        customerMessage: {
          en: "One more thing - the chopper blade is stainless steel, right? Last time I bought one on Amazon it turned out to be plastic.",
          hinglish:
            "Aur ek baat - chopper ka blade stainless steel hai na? Last time Amazon se liya tha, plastic nikla.",
        },
        hint: "Address product anxiety from past bad experience",
        options: [
          {
            text: {
              en: "Ma'am, the blades are definitely stainless steel. I'll WhatsApp you an actual unboxing photo of the product. And there's a 7-day return - if the quality doesn't match, full refund.",
              hinglish:
                "Ma'am, bilkul stainless steel blades hain. Main aapko WhatsApp pe product ka actual photo bhej deta hoon unboxing ka. Aur 7-din return hai - agar quality match nahi kari toh full refund.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Send the photo on WhatsApp. Alright, deliver it after 6. I'll keep ₹1,899 ready.",
              hinglish:
                "Photo bhej do WhatsApp pe. Theek hai, 6 baje ke baad bhijwa do. ₹1,899 ready rakhungi.",
            },
          },
          {
            text: {
              en: "Ma'am, our product is good quality - you'll see when it arrives.",
              hinglish: "Ma'am humaara product quality hai, aap dekhiyega aake.",
            },
            quality: "ok",
            points: 1,
            reaction: { en: "Hmm ok, we'll see.", hinglish: "Hmm ok, dekhte hain." },
          },
          {
            text: {
              en: "Ma'am, Amazon and our company are different things.",
              hinglish: "Ma'am Amazon aur humaari company alag hai.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "That's what they all say. Forget it, I don't want it.",
              hinglish: "Wahi toh, sab same kehte hain. Rehne do, nahi chahiye.",
            },
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You offered a time slot that works for the customer, addressed her product anxiety with evidence (photos), and confirmed the exact amount. She's committed with cash ready.",
    returnDebrief:
      "Customer wanted the product but needed flexibility. Forcing immediate cash or dismissing her concerns lost the sale. ₹170 round-trip shipping wasted.",
    keyTakeaway:
      "\"No cash right now\" usually means \"not right now\" - not \"I don't want it\". Offer a time slot. Confirm the amount. Send a WhatsApp reminder before delivery.",
  },

  {
    id: "price-shock",
    title: { en: "\"Wasn't this ₹799?\"", hinglish: "\"₹799 tha na ye?\"" },
    rtoCause: "Price mismatch between ad and checkout",
    difficulty: 3,
    orderValue: 999,
    shippingCost: 79,
    product: "Bluetooth neckband earphones",
    context:
      "Customer saw a Meta ad showing ₹799 for Bluetooth earphones. Actual product is ₹999 + ₹79 shipping = ₹1,078 at checkout. They ordered anyway but are now questioning the price on your confirmation call.",
    turns: [
      {
        customerMessage: {
          en: "This was ₹799, wasn't it? Why is the bill showing ₹1,078 now?",
          hinglish:
            "Bhai ₹799 mein tha na ye? Ab ₹1,078 kyu dikha raha hai bill mein?",
        },
        hint: "Don't dodge - explain transparently, then reframe the value",
        options: [
          {
            text: {
              en: "Sir, the product is ₹999 plus ₹79 delivery. The ₹799 in the ad was a limited-stock offer. But the MRP is ₹1,499 - you're still paying 28% less. And there's a 7-day free return, so no risk.",
              hinglish:
                "Sir, product ₹999 hai plus ₹79 delivery charge. Ad mein ₹799 wala offer limited stock tha. Lekin sir, MRP ₹1,499 hai - aap abhi bhi 28% less pay kar rahe hain. Aur 7-din free return hai, no risk.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Hmm... 28% less, that's true. And the return is free? Ok, let's see.",
              hinglish:
                "Hmm... 28% less toh hai. Aur return free hai? Ok, dekhte hain.",
            },
          },
          {
            text: {
              en: "Sir, it's ₹999 plus ₹79 shipping - ₹1,078 total.",
              hinglish: "Sir, ₹999 plus ₹79 shipping hai, total ₹1,078.",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "Yes, I can see that. But the ad said ₹799...",
              hinglish: "Haan wo toh dikh raha hai. But ad mein ₹799 tha na...",
            },
          },
          {
            text: {
              en: "Sir, that offer is over. This is the price now.",
              hinglish: "Sir wo offer khatam ho gaya, yahi price hai ab.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "Then why show ₹799 in the ad? This is fraud. Cancel it.",
              hinglish:
                "Toh ad mein kyu dikhate ho ₹799? Fraud hai ye. Cancel karo.",
            },
          },
        ],
      },
      {
        customerMessage: {
          en: "It feels like too much... I'll have to think about it.",
          hinglish: "Zyada lag raha hai yaar... sochna padega.",
        },
        hint: "Remove risk - free return is your strongest weapon",
        options: [
          {
            text: {
              en: "I understand, sir. Let's do this - let it be delivered, use it for 2-3 days. Test the sound quality, battery life, everything. If you don't like it, free return and a full refund. Zero risk.",
              hinglish:
                "Sir, samajh sakta hoon. Ek kaam karte hain - deliver hone do, 2-3 din use karke dekhein. Sound quality, battery life - sab test karein. Pasand nahi aaya toh free return, poora paisa wapas. Zero risk.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Hmm alright, let it come then. I'll test it out. I'll keep the cash ready.",
              hinglish:
                "Hmm theek hai, aane do fir. Test karke dekhunga. Cash ready rakhunga.",
            },
          },
          {
            text: {
              en: "Sir, take your time - let me know if you want to cancel.",
              hinglish: "Sir aap soch lein, cancel karna hai toh bataiye.",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "No, let it come. We'll see.",
              hinglish: "Nahi, aane do. Dekhte hain.",
            },
          },
          {
            text: {
              en: "Sir, this is the price. Take it or cancel it.",
              hinglish: "Sir yahi price hai, lena hai toh lo warna cancel karo.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "Is that any way to talk to a customer? Cancel it, I'll buy it somewhere else.",
              hinglish:
                "Bhai aise koi baat karta hai kya? Cancel karo, kahi aur se le lunga.",
            },
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You acknowledged the price gap honestly, reframed the value against MRP, and used the return policy to eliminate risk. Price shock resolved - this order delivers.",
    returnDebrief:
      "Customer felt misled by the ad price. Without reframing the value and de-risking, they'll refuse at the door. ₹158 round-trip shipping lost, plus a potential negative review.",
    keyTakeaway:
      "Never dodge a price question. Acknowledge → reframe against MRP → lead with the return policy. \"Zero risk\" converts more than \"great deal\".",
  },

  {
    id: "unreachable-ndr",
    title: { en: "3 missed calls, 1 WhatsApp", hinglish: "3 missed calls, 1 WhatsApp" },
    rtoCause: "Customer unreachable / NDR",
    difficulty: 3,
    orderValue: 2499,
    shippingCost: 95,
    product: "Travel backpack (45L, cabin size)",
    context:
      "Customer ordered a ₹2,499 travel backpack. Delivery boy tried 3 times - customer didn't answer. Package is in \"NDR\" (Non-Delivery Report) status. One more failed attempt and it auto-returns. You send a WhatsApp with order photo.",
    turns: [
      {
        customerMessage: {
          en: "Sorry, I was in meetings all day. Can the delivery happen tomorrow?",
          hinglish:
            "Sorry bhai, meeting mein tha din bhar. Kal ho sakti hai delivery?",
        },
        hint: "They want the product - just need a workable time",
        options: [
          {
            text: {
              en: "No problem sir! I'm booking tomorrow's slot. Morning or afternoon - when will you be available? A backup phone number would also help the delivery boy.",
              hinglish:
                "No problem sir! Kal ka slot book karta hoon. Morning ya afternoon - kab available honge? Ek backup phone number mil jayega toh delivery boy ke liye helpful hoga.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "Afternoon, after 2 PM. Take my wife's number as backup - 98XXXXXXXX.",
              hinglish:
                "Afternoon, 2 baje ke baad. Wife ka number le lo backup - 98XXXXXXXX.",
            },
          },
          {
            text: {
              en: "Yes sir, there will be a re-attempt tomorrow.",
              hinglish: "Haan sir kal re-attempt hoga.",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "Ok. Try after 2 PM.",
              hinglish: "Ok. Try karo 2 baje ke baad.",
            },
          },
          {
            text: {
              en: "Sir, we tried 3 times. There's only one attempt left - after that it auto-returns.",
              hinglish:
                "Sir 3 baar try kiya, ek aur attempt hai bas, uske baad auto-return ho jayega.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "It's not my fault, I was in meetings. Don't return it - I'll take it tomorrow.",
              hinglish:
                "Yaar meri galti nahi hai meeting mein tha. Return mat karo, kal le lunga.",
            },
          },
        ],
      },
      {
        customerMessage: {
          en: "And the packing is proper, right? Last time a bag came via Delhivery with a broken zipper.",
          hinglish:
            "Aur bhai, packing theek hai na? Last time Delhivery se ek bag aaya tha, zipper tuta hua tha.",
        },
        hint: "Pre-empt the damage objection - commit them",
        options: [
          {
            text: {
              en: "Sir, it's packed in double-layer bubble wrap. Open and check it at delivery tomorrow - zipper, compartments, everything. If there's any issue at all, return it on the spot. Please keep ₹2,499 cash ready - I'll also send a WhatsApp reminder tomorrow morning.",
              hinglish:
                "Sir, double-layer bubble wrap mein packed hai. Kal delivery ke time khol ke check kar lena - zipper, compartments, sab. Agar kuch bhi issue hai toh on-the-spot return. ₹2,499 cash ready rakhiyega. Main kal subah WhatsApp pe reminder bhi bhej dunga.",
            },
            quality: "best",
            points: 2,
            reaction: {
              en: "You're a real professional. Alright, tomorrow at 2. Cash will be ready.",
              hinglish:
                "Bhai tum toh professional ho. Theek hai, kal 2 baje. Cash ready hoga.",
            },
          },
          {
            text: {
              en: "Sir, the packing is fine, you'll see.",
              hinglish: "Sir packing theek hai, aap dekhiyega.",
            },
            quality: "ok",
            points: 1,
            reaction: {
              en: "Hmm ok. We'll see tomorrow.",
              hinglish: "Hmm ok. Dekhte hain kal.",
            },
          },
          {
            text: {
              en: "Sir, packing isn't our responsibility - that's the courier's job.",
              hinglish:
                "Sir packing humaari responsibility nahi hai, courier ki hai.",
            },
            quality: "bad",
            points: 0,
            reaction: {
              en: "Then it's not my responsibility either. If it arrives damaged, I'm refusing it.",
              hinglish:
                "Toh meri responsibility bhi nahi hai. Damaged aaya toh refuse karunga.",
            },
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You rescued an NDR order that was one attempt away from auto-return. Backup number, time slot, WhatsApp reminder, and on-the-spot check promise sealed the delivery. ₹2,499 order saved.",
    returnDebrief:
      "This was a ₹2,499 order - ₹190 round-trip shipping lost. The customer wanted the product; they just weren't available. A time slot and backup number would have saved it.",
    keyTakeaway:
      "NDR ≠ cancellation. Most NDR orders can still deliver on the next attempt IF you get: (1) a time slot, (2) a backup number, (3) a WhatsApp reminder the morning of delivery.",
  },
];
