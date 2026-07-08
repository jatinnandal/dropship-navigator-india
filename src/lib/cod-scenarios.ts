export type ReplyOption = {
  text: string;
  quality: "best" | "ok" | "bad";
  points: number;
  reaction: string;
};

export type Turn = {
  customerMessage: string;
  hint?: string;
  options: ReplyOption[];
};

export type Scenario = {
  id: string;
  title: string;
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
    title: "The vague address",
    rtoCause: "Incomplete / wrong address",
    difficulty: 1,
    orderValue: 699,
    shippingCost: 65,
    product: "Phone case (transparent, slim fit)",
    context:
      "Customer ordered a ₹699 phone case COD. Address given: \"Near Shiv Temple, Sector 7, Noida.\" No flat number, no landmark, no alternate phone. Delivery will fail without better details.",
    turns: [
      {
        customerMessage:
          "Haan bhai, order kiya hai maine. Phone case wala.",
        hint: "Address is incomplete — you need a flat number and landmark",
        options: [
          {
            text: "Sir, delivery smooth hoga agar aap flat number aur nearby landmark bata dein. Koi alternate phone number bhi hai?",
            quality: "best",
            points: 2,
            reaction:
              "Hmm haan, Flat 302, Sunshine Apartments hai. Temple ke saamne wali gali. Wife ka number de doon? 98XXXXXXXX.",
          },
          {
            text: "Sir, aapka address confirm kar raha hoon — Near Shiv Temple, Sector 7, Noida — sahi hai?",
            quality: "ok",
            points: 1,
            reaction:
              "Haan sahi hai... waise Sector 7 mein bahut temples hain. Sunshine Apartments hai actually.",
          },
          {
            text: "Sir address incomplete hai, full address do warna cancel ho jayega.",
            quality: "bad",
            points: 0,
            reaction:
              "Kya matlab cancel? Maine order kiya hai, tum deliver karo na. Rehne do, cancel kar do.",
          },
        ],
      },
      {
        customerMessage:
          "Toh kab tak aayega? Kal chahiye mujhe.",
        hint: "Confirm timeline and cash amount — reduce uncertainty",
        options: [
          {
            text: "Sir, kal afternoon tak deliver hoga. ₹699 cash ready rakhiyega. Main dispatch hone pe WhatsApp pe tracking bhi bhej dunga.",
            quality: "best",
            points: 2,
            reaction:
              "Theek hai bhai, done. Cash rakh lunga. WhatsApp kar dena.",
          },
          {
            text: "Kal tak ho jayega sir.",
            quality: "ok",
            points: 1,
            reaction: "Ok.",
          },
          {
            text: "Sir delivery timeline system pe depend karta hai, exact nahi bata sakta.",
            quality: "bad",
            points: 0,
            reaction:
              "Yaar tum logon ka koi bharosa nahi, agar nahi aaya toh cancel.",
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
      "Always get: flat/house number, landmark, alternate phone. A 30-second call saves ₹60–130 in RTO shipping.",
  },

  {
    id: "impulse-regret",
    title: "The 2 AM impulse buy",
    rtoCause: "Buyer's remorse / impulse order",
    difficulty: 2,
    orderValue: 1299,
    shippingCost: 75,
    product: "Fitness tracker (budget smart band)",
    context:
      "Customer ordered a ₹1,299 fitness tracker at 2:14 AM. It's now 10 AM and you're calling to confirm. Their voice sounds hesitant — classic impulse regret pattern.",
    turns: [
      {
        customerMessage:
          "Hmm... haan maine order kiya tha... actually soch raha hoon chahiye ya nahi.",
        hint: "Don't pressure — reduce friction and risk perception",
        options: [
          {
            text: "Sir, koi stress nahi. Delivery parson aayegi. Dekhiyega, pasand nahi aaya toh 7-day free return hai — no questions. Bas address confirm kar raha hoon.",
            quality: "best",
            points: 2,
            reaction:
              "Accha, return free hai? Ok theek hai, aane do fir. Dekhte hain.",
          },
          {
            text: "Sir order confirm hai. Cancel karna hai toh abhi bataiye.",
            quality: "ok",
            points: 1,
            reaction:
              "Hmm... nahi rehne do, aane do. Dekhte hain.",
          },
          {
            text: "Sir order ho gaya hai, ab system mein cancel nahi hoga.",
            quality: "bad",
            points: 0,
            reaction:
              "Kya? Cancel nahi hoga? Toh main lena hi nahi chahta, delivery ke time refuse kar dunga.",
          },
        ],
      },
      {
        customerMessage:
          "Ek baat batao — ye original hai na? Amazon pe same ₹899 mein dikh raha hai.",
        hint: "Validate the concern, add value beyond price",
        options: [
          {
            text: "Sir, 100% original hai with warranty card. Amazon pe wo purana model hai bina heart rate sensor ke. Aapka wala latest version hai with SpO2 bhi. Plus humare yahan COD hai — pay only when you see the product.",
            quality: "best",
            points: 2,
            reaction:
              "Accha, SpO2 bhi hai? Ok bhai, bhej do. Office pe bhijwa sakte ho? Address change karna hai.",
          },
          {
            text: "Sir humaara product original hai, aap compare kar sakte hain.",
            quality: "ok",
            points: 1,
            reaction: "Hmm ok. Bhej do fir.",
          },
          {
            text: "Sir price compare mat karo, humaara quality different hai.",
            quality: "bad",
            points: 0,
            reaction:
              "Bhai quality different hai toh prove karo na. Rehne do, cancel karo.",
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You de-risked the purchase with the return policy and justified the price with product knowledge. The customer shifted from \"do I want this\" to \"where should I get it delivered\" — that's a converted order.",
    returnDebrief:
      "The customer was already on the fence. Without de-risking, they'll refuse at the door — classic RTO. You eat ₹150 in round-trip shipping plus the product may come back damaged.",
    keyTakeaway:
      "For impulse orders: (1) never pressure, (2) lead with the return policy to reduce risk, (3) justify the price gap if they comparison-shop.",
  },

  {
    id: "cash-not-ready",
    title: "\"Cash nahi hai abhi\"",
    rtoCause: "Cash not available at delivery",
    difficulty: 2,
    orderValue: 1899,
    shippingCost: 85,
    product: "Electric chopper (kitchen appliance)",
    context:
      "Customer ordered a ₹1,899 kitchen chopper COD. You call to confirm. She's interested but says she doesn't have cash right now — husband brings cash in the evening.",
    turns: [
      {
        customerMessage:
          "Haan maine order kiya hai, lekin abhi mere paas cash nahi hai. Husband evening mein laayenge.",
        hint: "Offer flexibility — don't force immediate delivery",
        options: [
          {
            text: "Koi baat nahi ma'am. Kab convenient hoga? Main evening slot mein schedule kar deta hoon — 5 se 7 PM chalega?",
            quality: "best",
            points: 2,
            reaction:
              "Haan 6 baje ke baad theek rahega. Husband bhi ghar honge tab.",
          },
          {
            text: "Ma'am cash rakh lijiye, delivery boy aayega tab dena padega.",
            quality: "ok",
            points: 1,
            reaction:
              "Hmm theek hai, try karungi ATM se nikaalne ki.",
          },
          {
            text: "Ma'am COD hai toh cash ready hona chahiye. Cancel kar dein?",
            quality: "bad",
            points: 0,
            reaction:
              "Cancel kyu? Main lena chahti hoon, bas abhi cash nahi hai. Rehne do fir, cancel karo.",
          },
        ],
      },
      {
        customerMessage:
          "Aur ek baat — chopper ka blade stainless steel hai na? Last time Amazon se liya tha, plastic nikla.",
        hint: "Address product anxiety from past bad experience",
        options: [
          {
            text: "Ma'am, bilkul stainless steel blades hain. Main aapko WhatsApp pe product ka actual photo bhej deta hoon unboxing ka. Aur 7-din return hai — agar quality match nahi kari toh full refund.",
            quality: "best",
            points: 2,
            reaction:
              "Photo bhej do WhatsApp pe. Theek hai, 6 baje ke baad bhijwa do. ₹1,899 ready rakhungi.",
          },
          {
            text: "Ma'am humaara product quality hai, aap dekhiyega aake.",
            quality: "ok",
            points: 1,
            reaction: "Hmm ok, dekhte hain.",
          },
          {
            text: "Ma'am Amazon aur humaari company alag hai.",
            quality: "bad",
            points: 0,
            reaction:
              "Wahi toh, sab same kehte hain. Rehne do, nahi chahiye.",
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
      "\"Cash nahi hai\" usually means \"not right now\" — not \"I don't want it\". Offer a time slot. Confirm the amount. Send a WhatsApp reminder before delivery.",
  },

  {
    id: "price-shock",
    title: "\"₹799 tha na ye?\"",
    rtoCause: "Price mismatch between ad and checkout",
    difficulty: 3,
    orderValue: 999,
    shippingCost: 79,
    product: "Bluetooth neckband earphones",
    context:
      "Customer saw a Meta ad showing ₹799 for Bluetooth earphones. Actual product is ₹999 + ₹79 shipping = ₹1,078 at checkout. They ordered anyway but are now questioning the price on your confirmation call.",
    turns: [
      {
        customerMessage:
          "Bhai ₹799 mein tha na ye? Ab ₹1,078 kyu dikha raha hai bill mein?",
        hint: "Don't dodge — explain transparently, then reframe the value",
        options: [
          {
            text: "Sir, product ₹999 hai plus ₹79 delivery charge. Ad mein ₹799 wala offer limited stock tha. Lekin sir, MRP ₹1,499 hai — aap abhi bhi 28% less pay kar rahe hain. Aur 7-din free return hai, no risk.",
            quality: "best",
            points: 2,
            reaction:
              "Hmm... 28% less toh hai. Aur return free hai? Ok, dekhte hain.",
          },
          {
            text: "Sir, ₹999 plus ₹79 shipping hai, total ₹1,078.",
            quality: "ok",
            points: 1,
            reaction:
              "Haan wo toh dikh raha hai. But ad mein ₹799 tha na...",
          },
          {
            text: "Sir wo offer khatam ho gaya, yahi price hai ab.",
            quality: "bad",
            points: 0,
            reaction:
              "Toh ad mein kyu dikhate ho ₹799? Fraud hai ye. Cancel karo.",
          },
        ],
      },
      {
        customerMessage:
          "Zyada lag raha hai yaar... sochna padega.",
        hint: "Remove risk — free return is your strongest weapon",
        options: [
          {
            text: "Sir, samajh sakta hoon. Ek kaam karte hain — deliver hone do, 2-3 din use karke dekhein. Sound quality, battery life — sab test karein. Pasand nahi aaya toh free return, poora paisa wapas. Zero risk.",
            quality: "best",
            points: 2,
            reaction:
              "Hmm theek hai, aane do fir. Test karke dekhunga. Cash ready rakhunga.",
          },
          {
            text: "Sir aap soch lein, cancel karna hai toh bataiye.",
            quality: "ok",
            points: 1,
            reaction: "Nahi, aane do. Dekhte hain.",
          },
          {
            text: "Sir yahi price hai, lena hai toh lo warna cancel karo.",
            quality: "bad",
            points: 0,
            reaction:
              "Bhai aise koi baat karta hai kya? Cancel karo, kahi aur se le lunga.",
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You acknowledged the price gap honestly, reframed the value against MRP, and used the return policy to eliminate risk. Price shock resolved — this order delivers.",
    returnDebrief:
      "Customer felt misled by the ad price. Without reframing the value and de-risking, they'll refuse at the door. ₹158 round-trip shipping lost, plus a potential negative review.",
    keyTakeaway:
      "Never dodge a price question. Acknowledge → reframe against MRP → lead with the return policy. \"Zero risk\" converts more than \"great deal\".",
  },

  {
    id: "unreachable-ndr",
    title: "3 missed calls, 1 WhatsApp",
    rtoCause: "Customer unreachable / NDR",
    difficulty: 3,
    orderValue: 2499,
    shippingCost: 95,
    product: "Travel backpack (45L, cabin size)",
    context:
      "Customer ordered a ₹2,499 travel backpack. Delivery boy tried 3 times — customer didn't answer. Package is in \"NDR\" (Non-Delivery Report) status. One more failed attempt and it auto-returns. You send a WhatsApp with order photo.",
    turns: [
      {
        customerMessage:
          "Sorry bhai, meeting mein tha din bhar. Kal ho sakti hai delivery?",
        hint: "They want the product — just need a workable time",
        options: [
          {
            text: "No problem sir! Kal ka slot book karta hoon. Morning ya afternoon — kab available honge? Ek backup phone number mil jayega toh delivery boy ke liye helpful hoga.",
            quality: "best",
            points: 2,
            reaction:
              "Afternoon, 2 baje ke baad. Wife ka number le lo backup — 98XXXXXXXX.",
          },
          {
            text: "Haan sir kal re-attempt hoga.",
            quality: "ok",
            points: 1,
            reaction: "Ok. Try karo 2 baje ke baad.",
          },
          {
            text: "Sir 3 baar try kiya, ek aur attempt hai bas, uske baad auto-return ho jayega.",
            quality: "bad",
            points: 0,
            reaction:
              "Yaar meri galti nahi hai meeting mein tha. Return mat karo, kal le lunga.",
          },
        ],
      },
      {
        customerMessage:
          "Aur bhai, packing theek hai na? Last time Delhivery se ek bag aaya tha, zipper tuta hua tha.",
        hint: "Pre-empt the damage objection — commit them",
        options: [
          {
            text: "Sir, double-layer bubble wrap mein packed hai. Kal delivery ke time khol ke check kar lena — zipper, compartments, sab. Agar kuch bhi issue hai toh on-the-spot return. ₹2,499 cash ready rakhiyega. Main kal subah WhatsApp pe reminder bhi bhej dunga.",
            quality: "best",
            points: 2,
            reaction:
              "Bhai tum toh professional ho. Theek hai, kal 2 baje. Cash ready hoga.",
          },
          {
            text: "Sir packing theek hai, aap dekhiyega.",
            quality: "ok",
            points: 1,
            reaction: "Hmm ok. Dekhte hain kal.",
          },
          {
            text: "Sir packing humaari responsibility nahi hai, courier ki hai.",
            quality: "bad",
            points: 0,
            reaction:
              "Toh meri responsibility bhi nahi hai. Damaged aaya toh refuse karunga.",
          },
        ],
      },
    ],
    shipThreshold: 3,
    shipDebrief:
      "You rescued an NDR order that was one attempt away from auto-return. Backup number, time slot, WhatsApp reminder, and on-the-spot check promise sealed the delivery. ₹2,499 order saved.",
    returnDebrief:
      "This was a ₹2,499 order — ₹190 round-trip shipping lost. The customer wanted the product; they just weren't available. A time slot and backup number would have saved it.",
    keyTakeaway:
      "NDR ≠ cancellation. 70% of NDR orders deliver on the next attempt IF you get: (1) a time slot, (2) a backup number, (3) a WhatsApp reminder the morning of delivery.",
  },
];
