import type { Locale } from "@/i18n/config";

export type PageKey =
  | "alloys"
  | "productForms"
  | "industries"
  | "capabilities"
  | "quality"
  | "resources"
  | "news"
  | "about"
  | "contact"
  | "requestQuote";

type PageCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

const content: Record<Locale, Record<PageKey, PageCopy>> = {
  en: {
    alloys: {
      eyebrow: "Material portfolio",
      title: "Superalloys engineered for extreme conditions",
      description:
        "This route will become the searchable alloy catalogue, organized by alloy family, grade, standard and application.",
    },
    productForms: {
      eyebrow: "Supply range",
      title: "Product forms for every manufacturing stage",
      description:
        "Bars, sheets, plates, tubes, wires, forgings and custom components will be managed here through the CMS.",
    },
    industries: {
      eyebrow: "Applications",
      title: "Materials for demanding industries",
      description:
        "Aerospace, energy, gas turbines, oil and gas, chemical processing and other high-temperature environments.",
    },
    capabilities: {
      eyebrow: "What we can deliver",
      title: "Manufacturing, processing and testing capabilities",
      description:
        "A structured overview of production, machining, inspection, traceability and export delivery capabilities.",
    },
    quality: {
      eyebrow: "Confidence by evidence",
      title: "Quality systems, standards and certifications",
      description:
        "Certifications, test reports, material traceability and applicable international standards will be presented here.",
    },
    resources: {
      eyebrow: "Technical library",
      title: "Data sheets and engineering resources",
      description:
        "A central location for downloadable product data, alloy comparisons, standards and technical articles.",
    },
    news: {
      eyebrow: "Company updates",
      title: "News and technical insights",
      description:
        "CMS-managed company news and technical content, designed for a new publication roughly every two weeks.",
    },
    about: {
      eyebrow: "Company",
      title: "A reliable superalloy supply partner",
      description:
        "The final page will explain the company identity, locations, export experience, team and long-term customer value.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Talk with our international team",
      description:
        "General enquiries, partnership requests and regional contact information will be placed here.",
    },
    requestQuote: {
      eyebrow: "Request for quotation",
      title: "Tell us what material you need",
      description:
        "The future RFQ form will collect grade, form, standard, dimensions, quantity, delivery requirements and secure attachments.",
    },
  },
  zh: {
    alloys: {
      eyebrow: "材料产品",
      title: "面向极端工况的高温合金",
      description: "这里将成为可筛选的合金目录，并按照材料体系、牌号、标准和应用组织。",
    },
    productForms: {
      eyebrow: "供货范围",
      title: "覆盖不同制造阶段的产品形态",
      description: "棒材、板材、管材、丝材、锻件和定制零部件将通过 CMS 统一管理。",
    },
    industries: {
      eyebrow: "行业应用",
      title: "服务高要求工业领域",
      description: "面向航空航天、能源、燃气轮机、油气、化工及其他高温应用环境。",
    },
    capabilities: {
      eyebrow: "交付能力",
      title: "生产、加工与检测能力",
      description: "系统展示生产、机加工、检测、材料追溯以及出口交付能力。",
    },
    quality: {
      eyebrow: "质量可信",
      title: "质量体系、标准与认证",
      description: "展示企业认证、检测报告、材料追溯能力以及适用的国际标准。",
    },
    resources: {
      eyebrow: "技术资料库",
      title: "数据表与工程资料",
      description: "集中提供产品数据表、合金对比、标准说明及技术文章。",
    },
    news: {
      eyebrow: "企业动态",
      title: "新闻与技术洞察",
      description: "由 CMS 管理企业新闻和技术内容，适配约每两周一次的发布节奏。",
    },
    about: {
      eyebrow: "公司介绍",
      title: "可靠的高温合金供应伙伴",
      description: "后续将在这里介绍企业身份、所在地、出口经验、团队和长期客户价值。",
    },
    contact: {
      eyebrow: "联系我们",
      title: "联系国际业务团队",
      description: "用于一般咨询、合作需求以及不同区域的联系方式。",
    },
    requestQuote: {
      eyebrow: "提交询价",
      title: "告诉我们你需要的材料",
      description: "未来的 RFQ 表单将收集牌号、形态、标准、尺寸、数量、交期和安全附件。",
    },
  },
};

export function getPageCopy(locale: Locale, key: PageKey): PageCopy {
  return content[locale][key];
}
