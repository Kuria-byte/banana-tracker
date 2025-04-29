export const knowledgeData = [
  {
    id: "basics",
    title: "Plantain Basics",
    sections: [
      {
        id: "introduction",
        title: "Introduction to Plantains",
        content: [
          "Plantains (Musa paradisiaca) are a type of banana with a starchier, less sweet fruit that is typically cooked before eating. They are a staple food in tropical regions around the world, particularly in Africa, the Caribbean, and parts of Latin America.",
          "Unlike dessert bananas, plantains are larger, firmer, and contain less sugar. They are an excellent source of complex carbohydrates, vitamins A and C, and potassium. Plantains are versatile and can be prepared at various stages of ripeness, from green (unripe) to yellow (ripe) to black (very ripe).",
          {
            type: "image",
            src: "/placeholder.svg?height=300&width=600",
            alt: "Different stages of plantain ripeness",
            caption: "Plantains at different stages of ripeness: green (unripe), yellow (ripe), and black (very ripe)",
          },
          "Plantains are grown in more than 120 countries and are a critical food security crop for millions of people worldwide. The global production of plantains exceeds 30 million metric tons annually.",
        ],
      },
      {
        id: "varieties",
        title: "Plantain Varieties",
        content: [
          "There are numerous plantain varieties cultivated worldwide, each with unique characteristics suited to different growing conditions and culinary uses. The main types include:",
          {
            type: "list",
            items: [
              "French Plantains: Characterized by their large bunches with fruits arranged in a spiral pattern. They typically have 7-10 hands per bunch and are known for their high yield.",
              "Horn Plantains: Distinguished by their large, curved fruits and fewer hands per bunch (usually 3-5). They are known for their robust flavor and are preferred in many African cuisines.",
              "False Horn Plantains: A hybrid between French and Horn types, with intermediate characteristics. They typically have 5-8 hands per bunch.",
              "Dwarf Plantains: Shorter plants that are more resistant to wind damage and easier to harvest. Popular varieties include the Dwarf French.",
            ],
          },
          {
            type: "card",
            title: "Variety Selection Tip",
            description: "Choosing the right variety for your farm",
            content:
              "Select varieties based on your local climate, soil conditions, and market demands. Consider disease resistance, yield potential, and growth cycle when making your selection.",
            tags: ["selection", "varieties", "planning"],
            variant: "tip",
          },
        ],
      },
      {
        id: "nutritional-value",
        title: "Nutritional Value",
        content: [
          "Plantains are highly nutritious and offer significant health benefits. A medium-sized plantain (about 179g) contains:",
          {
            type: "list",
            items: [
              "218 calories",
              "0.7g of fat",
              "57g of carbohydrates",
              "4g of fiber",
              "2g of protein",
              "27mg of vitamin C (31% of daily value)",
              "1,668 IU of vitamin A (33% of daily value)",
              "739mg of potassium (16% of daily value)",
              "55mg of magnesium (14% of daily value)",
            ],
          },
          "Plantains are also rich in various antioxidants, particularly vitamin C and beta-carotene, which help fight free radicals and reduce oxidative stress.",
          {
            type: "card",
            title: "Health Benefits",
            content:
              "Regular consumption of plantains may help improve digestive health, regulate blood pressure, boost immune function, and promote heart health due to their fiber, potassium, and antioxidant content.",
            variant: "info",
          },
        ],
      },
    ],
  },
  {
    id: "cultivation",
    title: "Plantain Cultivation",
    sections: [
      {
        id: "site-selection",
        title: "Site Selection and Preparation",
        content: [
          "Proper site selection is crucial for successful plantain cultivation. Consider the following factors:",
          {
            type: "list",
            items: [
              "Climate: Plantains thrive in tropical and subtropical regions with temperatures between 25-35°C (77-95°F) and annual rainfall of 1,500-2,500mm.",
              "Soil: Well-drained, fertile loamy soil with pH 5.5-7.0 is ideal. Avoid waterlogged areas and heavy clay soils.",
              "Sunlight: Choose a location with full sun exposure (at least 6-8 hours daily).",
              "Wind protection: Select areas protected from strong winds or plan for windbreaks to prevent plant damage.",
              "Accessibility: Ensure the site has good access to water sources and transportation routes for farm operations and product distribution.",
            ],
          },
          "Site preparation involves several steps to create optimal growing conditions:",
          {
            type: "list",
            items: [
              "Clear the land of vegetation, rocks, and debris.",
              "Test soil fertility and pH levels to determine amendment needs.",
              "Apply organic matter (compost or well-rotted manure) to improve soil structure and fertility.",
              "Prepare drainage channels if the site is prone to waterlogging.",
              "Create raised beds in areas with high rainfall to prevent root rot.",
              "Apply lime if soil pH is below the recommended range.",
            ],
          },
          {
            type: "card",
            title: "Soil Preparation Warning",
            content:
              "Never plant plantains in poorly drained soils. Waterlogged conditions lead to root rot and increased susceptibility to Panama disease and other fungal infections.",
            variant: "warning",
            tags: ["soil", "preparation", "drainage"],
          },
        ],
      },
      {
        id: "planting-techniques",
        title: "Planting Techniques",
        content: [
          "Plantains are propagated vegetatively using planting materials called suckers. The planting process involves several key steps:",
          "Sucker Selection: Choose healthy suckers from disease-free mother plants. The ideal suckers are 'sword suckers' with narrow leaves and a conical base, about 1-1.5m tall.",
          {
            type: "image",
            src: "/placeholder.svg?height=300&width=500",
            alt: "Plantain sword sucker",
            caption: "A healthy sword sucker suitable for planting",
          },
          "Sucker Preparation:",
          {
            type: "list",
            items: [
              "Clean the suckers by removing soil and roots.",
              "Trim the pseudostem to 15-20cm above the corm.",
              "Remove any discolored or diseased tissue.",
              "Treat with a fungicide solution to prevent disease transmission.",
              "Allow the cut surfaces to dry for 1-2 days before planting.",
            ],
          },
          "Planting Method:",
          {
            type: "list",
            items: [
              "Dig planting holes 30-45cm deep and 30-45cm wide.",
              "Space plants 2-3m apart in rows, with 3-4m between rows (about 1,000-1,600 plants per hectare).",
              "Add 10-15kg of organic matter to each planting hole.",
              "Place the sucker in the hole with the cut surface slightly above ground level.",
              "Fill the hole with soil, pressing firmly around the base to eliminate air pockets.",
              "Create a basin around each plant to hold water.",
              "Apply mulch around the plant to conserve moisture and suppress weeds.",
            ],
          },
          {
            type: "card",
            title: "Planting Season Tip",
            content:
              "Plant at the beginning of the rainy season to ensure adequate moisture for establishment. If irrigation is available, planting can be done year-round.",
            variant: "tip",
            tags: ["planting", "season", "irrigation"],
          },
        ],
      },
      {
        id: "water-management",
        title: "Water Management",
        content: [
          "Proper water management is essential for optimal growth and high yields in plantain cultivation. Plantains require consistent moisture but are sensitive to waterlogging.",
          "Water Requirements:",
          {
            type: "list",
            items: [
              "Plantains need 25-50mm of water per week, depending on climate and soil conditions.",
              "Critical periods for water availability are establishment (first 3 months), flowering, and fruit development.",
              "Water stress during flowering can reduce bunch size and fruit quality.",
              "Excess water can lead to root rot, pseudostem toppling, and increased disease incidence.",
            ],
          },
          "Irrigation Methods:",
          {
            type: "list",
            items: [
              "Drip irrigation: Most efficient method, delivering water directly to the root zone.",
              "Micro-sprinklers: Provide good coverage with moderate water efficiency.",
              "Basin irrigation: Simple but less efficient, suitable for small-scale farms.",
              "Overhead irrigation: Less recommended due to high water loss and potential to spread foliar diseases.",
            ],
          },
          {
            type: "card",
            title: "Water Conservation Strategies",
            content:
              "Implement mulching with organic materials, maintain optimum plant density, and practice contour planting on slopes to maximize water use efficiency and reduce runoff.",
            variant: "info",
            tags: ["water", "conservation", "efficiency"],
          },
        ],
      },
    ],
  },
  {
    id: "management",
    title: "Plantation Management",
    sections: [
      {
        id: "fertilization",
        title: "Fertilization and Nutrition",
        content: [
          "Proper fertilization is critical for achieving optimal growth and yield in plantain cultivation. Plantains are heavy feeders and require adequate nutrients throughout their growing cycle.",
          "Nutrient Requirements:",
          {
            type: "list",
            items: [
              "Nitrogen (N): Essential for vegetative growth and leaf development. A mature plant requires 200-300g N per year.",
              "Phosphorus (P): Important for root development and flowering. Annual requirement is 30-50g P per plant.",
              "Potassium (K): Critical for fruit development and disease resistance. Annual requirement is 300-500g K per plant.",
              "Secondary nutrients (Ca, Mg, S) and micronutrients (Zn, B, Fe) are also essential but required in smaller amounts.",
            ],
          },
          "Fertilization Schedule:",
          {
            type: "list",
            items: [
              "Base application: Apply organic matter and phosphorus-rich fertilizers at planting.",
              "Establishment phase (1-3 months): Apply nitrogen-rich fertilizers to promote vegetative growth.",
              "Vegetative growth (4-6 months): Apply balanced NPK fertilizer.",
              "Pre-flowering (7-8 months): Increase potassium application to support bunch development.",
              "Fruit development: Maintain potassium levels for fruit filling.",
            ],
          },
          {
            type: "card",
            title: "Organic Fertilization",
            content:
              "Incorporate compost, well-rotted manure, or vermicompost at 10-15kg per plant annually. Apply in a ring around the plant, keeping material away from the stem to prevent rot.",
            tags: ["organic", "fertilization", "sustainability"],
            variant: "tip",
          },
        ],
      },
      {
        id: "weed-control",
        title: "Weed Control",
        content: [
          "Effective weed management is essential in plantain cultivation, as weeds compete for nutrients, water, and light, and can harbor pests and diseases.",
          "Weed Impact:",
          {
            type: "list",
            items: [
              "Yield reduction of 30-50% if weeds are not controlled.",
              "Competition for nutrients and water, especially during establishment.",
              "Potential hosts for pests and diseases.",
              "Interference with farm operations like irrigation and harvesting.",
            ],
          },
          "Weed Control Methods:",
          {
            type: "list",
            items: [
              "Cultural methods: Mulching with organic materials (dry leaves, rice straw, or plastic mulch) to suppress weed growth.",
              "Mechanical methods: Regular hand weeding or mechanical cultivation between rows.",
              "Cover crops: Planting leguminous cover crops between rows to suppress weeds and fix nitrogen.",
              "Chemical control: Using selective herbicides when necessary, following safety guidelines and application rates.",
            ],
          },
          {
            type: "card",
            title: "Integrated Weed Management",
            content:
              "Combine multiple weed control strategies rather than relying on a single method. This approach provides more effective control while reducing herbicide dependency.",
            variant: "info",
          },
        ],
      },
      {
        id: "pest-disease",
        title: "Pest and Disease Management",
        content: [
          "Plantains are susceptible to various pests and diseases that can significantly impact yield and quality. Integrated pest management (IPM) strategies are recommended for sustainable control.",
          "Major Pests:",
          {
            type: "list",
            items: [
              "Banana Weevil (Cosmopolites sordidus): Larvae tunnel through the corm, weakening the plant and reducing yields.",
              "Nematodes: Root-knot and lesion nematodes damage the root system, reducing nutrient uptake.",
              "Thrips: Cause scarring on fruit skin, reducing market value.",
              "Aphids and Scales: Suck plant sap and can transmit viral diseases.",
            ],
          },
          "Common Diseases:",
          {
            type: "list",
            items: [
              "Black Sigatoka (Mycosphaerella fijiensis): A fungal disease causing leaf spotting and premature leaf death.",
              "Panama Disease (Fusarium wilt): A soil-borne fungal disease that blocks the vascular system.",
              "Bacterial Wilt (Xanthomonas campestris): Causes yellowing, wilting, and eventual collapse of the plant.",
              "Bunchy Top Virus: Stunts growth and prevents fruit production.",
              "Banana Mosaic Virus: Causes mottling of leaves and reduced yields.",
            ],
          },
          {
            type: "card",
            title: "Disease Prevention",
            content:
              "Use certified disease-free planting material, practice crop rotation, maintain field sanitation, and implement early detection and removal of infected plants to prevent disease spread.",
            variant: "warning",
            tags: ["disease", "prevention", "sanitation"],
          },
        ],
      },
      {
        id: "pruning",
        title: "Pruning and Sucker Management",
        content: [
          "Proper pruning and sucker management are essential practices in plantain cultivation that directly impact plant health, yield, and farm productivity.",
          "Pruning Practices:",
          {
            type: "list",
            items: [
              "Leaf pruning: Remove old, diseased, or damaged leaves to improve air circulation and reduce disease pressure.",
              "Pseudostem removal: After harvest, cut the pseudostem close to ground level in stages to allow nutrients to transfer to suckers.",
              "De-budding: Remove the male bud after all female flowers have set fruit to conserve plant energy and reduce disease entry points.",
            ],
          },
          "Sucker Management:",
          {
            type: "list",
            items: [
              "Follow a mother-daughter-granddaughter system for continuous production.",
              "Select 1-2 vigorous suckers at optimal positions (opposite to the mother plant's leaning direction).",
              "Remove unwanted suckers when they are 30-60cm tall to reduce competition.",
              "Time sucker selection to ensure continuous production cycles.",
              "Use the removed suckers as planting material for new areas.",
            ],
          },
          {
            type: "image",
            src: "/placeholder.svg?height=300&width=500",
            alt: "Mother-daughter-granddaughter system",
            caption: "Illustration of the mother-daughter-granddaughter system in plantain cultivation",
          },
          {
            type: "card",
            title: "Tools Sanitation",
            content:
              "Always disinfect pruning tools with a 5% bleach solution or 70% alcohol between plants to prevent disease transmission, especially for bacterial wilt and Panama disease.",
            variant: "warning",
            tags: ["sanitation", "tools", "disease prevention"],
          },
        ],
      },
    ],
  },
  {
    id: "harvest",
    title: "Harvesting and Post-Harvest",
    sections: [
      {
        id: "harvesting",
        title: "Harvesting Techniques",
        content: [
          "Proper harvesting techniques ensure optimal fruit quality and minimize post-harvest losses. The timing and method of harvest significantly impact shelf life and market value.",
          "Harvest Indicators:",
          {
            type: "list",
            items: [
              "Time from flowering: Generally 90-120 days, depending on variety and climate.",
              "Fruit appearance: Fruits should be full and well-developed, with ridges beginning to round.",
              "Angularity: Sharp angles between sides of the fruit start to disappear.",
              "For cooking plantains: Harvest when fruits are mature but still green (75-80% mature).",
              "For ripening plantains: Harvest at 90% maturity for optimal ripening quality.",
            ],
          },
          "Harvesting Method:",
          {
            type: "list",
            items: [
              "Use a sharp knife or machete to make a partial cut on the pseudostem, allowing the bunch to lower slowly.",
              "Have a second person support the bunch to prevent impact damage.",
              "Cut the bunch from the stalk with a clean cut.",
              "Handle the bunch carefully to avoid bruising or damaging the fruits.",
              "Protect harvested bunches from direct sunlight and rain.",
              "Transport bunches carefully to the processing or packing area.",
            ],
          },
          {
            type: "card",
            title: "Harvesting Best Practice",
            content:
              "Harvest during the cooler parts of the day (early morning or late afternoon) to reduce field heat and extend shelf life. This also provides better working conditions for harvesters.",
            variant: "tip",
            tags: ["harvesting", "quality", "timing"],
          },
        ],
      },
      {
        id: "post-harvest",
        title: "Post-Harvest Handling",
        content: [
          "Effective post-harvest handling practices are crucial for maintaining fruit quality and extending shelf life. Plantains are perishable and require proper handling to reduce losses.",
          "Post-Harvest Steps:",
          {
            type: "list",
            items: [
              "De-handing: Carefully separate hands from the bunch using a sharp, clean knife.",
              "Cleaning: Wash fruits to remove latex, dirt, and debris.",
              "Sorting: Grade fruits based on size, maturity, and quality.",
              "Treatment: Apply fungicide or hot water treatment if needed to control post-harvest diseases.",
              "Packaging: Use appropriate containers that provide ventilation and protection.",
              "Storage: Store in cool, shaded areas with good air circulation.",
            ],
          },
          "Storage Conditions:",
          {
            type: "list",
            items: [
              "Green plantains: 13-14°C (55-57°F) with 85-95% relative humidity for up to 3 weeks.",
              "Ripening plantains: 18-20°C (64-68°F) with 85-95% relative humidity.",
              "Avoid storing with ethylene-producing fruits like apples or tomatoes if ripening needs to be delayed.",
              "Use modified atmosphere packaging for extended shelf life in commercial operations.",
            ],
          },
          {
            type: "card",
            title: "Reducing Post-Harvest Losses",
            content:
              "Post-harvest losses in plantains can reach 30-40%. Implement proper handling, packaging, and temperature management to significantly reduce these losses and increase marketable yield.",
            variant: "info",
            tags: ["post-harvest", "storage", "losses"],
          },
        ],
      },
      {
        id: "value-addition",
        title: "Value Addition and Processing",
        content: [
          "Value addition and processing extend the utility of plantains, create diverse products, and increase income potential for farmers. Processing addresses the perishable nature of fresh plantains and opens new market opportunities.",
          "Processing Methods:",
          {
            type: "list",
            items: [
              "Drying: Sun drying or mechanical drying to produce plantain chips or flour.",
              "Frying: Production of plantain chips, a popular snack worldwide.",
              "Roasting: Traditional method of preparing plantains in many cultures.",
              "Boiling: Common cooking method for green plantains.",
              "Fermenting: Used to produce traditional foods and beverages in some regions.",
              "Freezing: Processing ripe plantains for later use in various recipes.",
            ],
          },
          "Plantain Products:",
          {
            type: "list",
            items: [
              "Plantain flour: Produced from dried plantains, used in baking and cooking.",
              "Plantain chips: Popular snack made from thin slices of green plantains.",
              "Frozen plantains: Pre-cooked and frozen for convenience.",
              "Plantain vinegar: Produced through fermentation of ripe plantains.",
              "Plantain beer: Traditional alcoholic beverage in some African countries.",
              "Packaged traditional dishes: Ready-to-eat plantain-based meals.",
            ],
          },
          {
            type: "card",
            title: "Market Research",
            content:
              "Before investing in processing equipment, conduct thorough market research to identify demand, competition, and price points for processed plantain products in your target markets.",
            variant: "tip",
            tags: ["marketing", "processing", "value addition"],
          },
        ],
      },
    ],
  },
  {
    id: "economics",
    title: "Economics and Marketing",
    sections: [
      {
        id: "farm-economics",
        title: "Farm Economics",
        content: [
          "Understanding the economics of plantain farming is essential for sustainable and profitable production. Proper financial planning and management are key to success.",
          "Establishment Costs:",
          {
            type: "list",
            items: [
              "Land preparation: $500-1,000 per hectare",
              "Planting material: $800-1,200 per hectare (1,600 suckers)",
              "Irrigation system: $1,500-3,000 per hectare (if needed)",
              "Initial fertilization: $300-500 per hectare",
              "Labor: $400-600 per hectare",
              "Total establishment cost: $3,000-6,000 per hectare",
            ],
          },
          "Annual Operational Costs:",
          {
            type: "list",
            items: [
              "Fertilizers and amendments: $500-800 per hectare",
              "Pest and disease management: $300-500 per hectare",
              "Weed control: $200-400 per hectare",
              "Irrigation operational costs: $300-600 per hectare",
              "Labor for maintenance and harvesting: $800-1,500 per hectare",
              "Total annual operational cost: $2,100-3,800 per hectare",
            ],
          },
          "Expected Returns:",
          {
            type: "list",
            items: [
              "Average yield: 15-25 tons per hectare",
              "Market price: $0.30-0.60 per kg (varies by market and season)",
              "Gross revenue: $4,500-15,000 per hectare",
              "Net profit: $1,000-11,000 per hectare",
              "Return on investment: 20-200% (varies widely based on management and market conditions)",
            ],
          },
          {
            type: "card",
            title: "Economic Sustainability",
            content:
              "Diversify income streams by incorporating multiple plantain varieties, intercropping with compatible species, and exploring value addition opportunities to enhance farm resilience against market fluctuations.",
            variant: "info",
            tags: ["economics", "sustainability", "diversification"],
          },
        ],
      },
      {
        id: "marketing",
        title: "Marketing Strategies",
        content: [
          "Effective marketing strategies can significantly increase profitability in plantain farming by securing better prices and more reliable markets.",
          "Market Channels:",
          {
            type: "list",
            items: [
              "Local markets: Direct sales to consumers at local markets or farm stands.",
              "Wholesalers: Selling in bulk to intermediaries who distribute to retailers.",
              "Supermarkets: Direct supply agreements with retail chains.",
              "Processing companies: Contracts with companies that produce plantain chips or flour.",
              "Export markets: Access to international markets for premium prices (requires meeting quality standards).",
              "Institutional buyers: Schools, hospitals, or government agencies with regular demand.",
            ],
          },
          "Marketing Strategies:",
          {
            type: "list",
            items: [
              "Quality differentiation: Focus on producing high-quality plantains that command premium prices.",
              "Certification: Obtain organic, fair trade, or other certifications that open premium market segments.",
              "Branding: Develop a recognizable brand that represents quality and reliability.",
              "Cooperative marketing: Join farmer cooperatives to increase bargaining power and access larger markets.",
              "Value addition: Process plantains into higher-value products like chips or flour.",
              "Digital marketing: Use social media and e-commerce platforms to reach more customers.",
            ],
          },
          {
            type: "card",
            title: "Contract Farming",
            content:
              "Consider entering into contract farming arrangements with processors or exporters. These contracts can provide price stability, technical support, and guaranteed markets, reducing risk for farmers.",
            variant: "tip",
            tags: ["contracts", "marketing", "risk management"],
          },
        ],
      },
      {
        id: "value-chain",
        title: "Value Chain Development",
        content: [
          "Developing a robust plantain value chain creates opportunities for all stakeholders and enhances the sustainability of the industry. A well-functioning value chain connects producers to consumers efficiently while adding value at each stage.",
          "Value Chain Actors:",
          {
            type: "list",
            items: [
              "Input suppliers: Provide planting materials, fertilizers, pesticides, and equipment.",
              "Producers: Farmers who grow and harvest plantains.",
              "Aggregators: Collect produce from multiple small-scale farmers.",
              "Processors: Transform raw plantains into various products.",
              "Distributors: Move products from production areas to consumption centers.",
              "Retailers: Sell products directly to consumers.",
              "Exporters: Facilitate international trade of plantains and plantain products.",
              "Support services: Financial institutions, extension services, research organizations.",
            ],
          },
          "Value Chain Strengthening Strategies:",
          {
            type: "list",
            items: [
              "Horizontal integration: Form farmer groups or cooperatives to achieve economies of scale.",
              "Vertical integration: Develop partnerships across different levels of the value chain.",
              "Quality management systems: Implement standards and practices that ensure consistent quality.",
              "Information sharing: Create platforms for market information exchange among value chain actors.",
              "Access to finance: Develop financial products tailored to the needs of different value chain actors.",
              "Infrastructure development: Invest in storage, processing, and transportation facilities.",
            ],
          },
          {
            type: "card",
            title: "Inclusive Value Chains",
            content:
              "Develop inclusive value chains that integrate smallholder farmers, women, and youth. Inclusive approaches lead to more equitable distribution of benefits and greater social impact alongside economic growth.",
            variant: "info",
            tags: ["inclusion", "smallholders", "equity"],
          },
        ],
      },
    ],
  },
]
