import React from 'react';
import Navbar from './Navbar'; // Assuming Navbar.jsx is in the same directory
import Hero from './Hero';     // Assuming Hero.jsx is in the same directory
import Footer from './Footer'; // Assuming Footer.jsx is in the same directory

export default function TermsConditions() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0e1117] text-white">
      {/* Navbar component */}
      <Navbar />

      {/* Hero component */}
      <Hero />

      {/* Main content area for terms and conditions */}
      <main className="flex-grow max-w-screen-xl mx-auto px-6 py-12">
        {/* Applied text-align: right and direction: rtl for Arabic content */}
        <div className="bg-[#1a1d23] p-8 rounded-lg shadow-lg" style={{ direction: 'rtl', textAlign: 'right' }}>
          <h1 className="text-3xl font-bold mb-8 text-center" style={{ textAlign: 'right' }}>الشروط والأحكام</h1>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 1 - نطاق التطبيق</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            1.1 تنطبق هذه الشروط والأحكام العامة على كل عرض تقدمه Souktek وعلى كل عقد يُبرم بين Souktek والمستهلك. من خلال تفعيل زر "طلب ودفع"، يؤكد المستهلك قبوله لهذه الشروط.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            1.2 إذا تم اعتبار أي بند من هذه الشروط باطلًا أو تم إبطاله، تبقى البنود الأخرى سارية، ويتم استبدال البند الباطل ببند صحيح يُحقق الغرض الأصلي قدر الإمكان.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 2 - العرض</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            2.1 إذا كان العرض مشروطًا أو محدودًا بمدة زمنية، فسيتم ذكر ذلك صراحة.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            2.2 يحتوي العرض على وصف دقيق وكامل للمنتجات أو المحتوى الرقمي أو الخدمات، مع صور تمثل المنتجات بصدق.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            2.3 Souktek غير ملزمة بالأخطاء الظاهرة. إذا لم تكن Souktek هي ناشر المحتوى، فإن العرض يقتصر على ما يحدده الناشر. على المستهلك تنزيل الشروط من موقع الناشر بنفسه.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 3 - العقد</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            3.1 يتم إبرام العقد عند قبول المستهلك للعرض وتفعيل زر "الدفع"، بشرط استلام Souktek للمبلغ المستحق.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            3.2 إذا تم قبول العرض إلكترونيًا، تؤكد Souktek الاستلام عن طريق إرسال المنتج. يمكن للمستهلك فسخ العقد حتى يتم إرسال التأكيد.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 9 - عدم وجود حق في الانسحاب</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            3.3 المنتجات المقدمة هي محتوى رقمي غير ملموس. يوافق المستهلك صراحةً على بدء التسليم فور الدفع ويتنازل عن حقه في الانسحاب.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 4 - المسؤولية</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            4.1 إلى أقصى حد يسمح به القانون، لا تتحمل Souktek أي مسؤولية عن الأضرار الناتجة عن التأخير أو الرفض أو استخدام المنتجات، سواء كانت مباشرة أو غير مباشرة. الحد الأقصى للمسؤولية هو قيمة المنتج فقط.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 5 - التعويض</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            5.1 يتعهد المستهلك بتعويض Souktek عن أي مطالبات أو خسائر ناتجة عن استخدامه للمنتجات أو انتهاكه لهذه الشروط أو القوانين.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-blue-400" style={{ textAlign: 'right' }}>المادة 6 - إجراءات الشكاوى</h2>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            6 يجب على المستهلك تقديم الشكاوى فورًا مع توضيح كامل.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            6.1 يجب أن يتعاون المستهلك مع Souktek ويقدم جميع المعلومات الضرورية مثل لقطة شاشة.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            6.2 ترد Souktek خلال 14 يومًا، وإذا تطلب الأمر وقتًا أطول، يتم إشعار المستهلك بذلك.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            6.3 يجب إعطاء Souktek مدة 4 أسابيع لحل الشكوى قبل تصعيدها إلى نزاع.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4" style={{ textAlign: 'right' }}>
            6.4 يسقط حق الشكوى بعد 14 يومًا من استلام المنتج.
          </p>
        </div>
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
}