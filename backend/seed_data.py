import sys
from sqlalchemy.orm import Session
from database.database import SessionLocal, engine
from models import Base, Tool, Category

def create_categories(db: Session):
    """Create initial categories"""
    categories_data = [
        "Writing & Content",
        "Video & Animation",
        "Image Generation",
        "Audio & Music",
        "Code & Development",
        "Design & UI/UX",
        "Marketing & SEO",
        "Productivity",
        "Research & Data",
        "Chatbots & Assistants",
        "3D & Gaming",
        "Business & Analytics"
    ]
    
    categories = []
    for cat_name in categories_data:
        # Check if category already exists
        existing = db.query(Category).filter(Category.name == cat_name).first()
        if not existing:
            category = Category(name=cat_name)
            db.add(category)
            categories.append(category)
            print(f"✓ Created category: {cat_name}")
        else:
            categories.append(existing)
            print(f"⊘ Category already exists: {cat_name}")
    
    db.commit()
    return categories

def create_tools(db: Session, categories):
    """Create initial AI tools"""
    # Get categories by name for easier assignment
    cat_dict = {cat.name: cat for cat in categories}
    
    tools_data = [
        {
            "name": "ChatGPT",
            "description": "Advanced conversational AI by OpenAI. Great for writing, coding, brainstorming, and general assistance.",
            "link": "https://chat.openai.com",
            "logo_url": "https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.59f2e898.png",
            "pricing_type": "freemium",
            "categories": ["Writing & Content", "Chatbots & Assistants", "Code & Development"]
        },
        {
            "name": "Midjourney",
            "description": "AI art generator creating stunning images from text descriptions. Popular for creative and artistic work.",
            "link": "https://www.midjourney.com",
            "logo_url": "https://www.midjourney.com/apple-touch-icon.png",
            "pricing_type": "paid",
            "categories": ["Image Generation", "Design & UI/UX"]
        },
        {
            "name": "GitHub Copilot",
            "description": "AI pair programmer that helps you write code faster. Integrates directly into your IDE.",
            "link": "https://github.com/features/copilot",
            "logo_url": "https://github.githubassets.com/assets/apple-touch-icon-144x144-b882e354c005.png",
            "pricing_type": "paid",
            "categories": ["Code & Development"]
        },
        {
            "name": "Jasper AI",
            "description": "AI content platform for marketing teams. Generate blog posts, ads, and marketing copy.",
            "link": "https://www.jasper.ai",
            "logo_url": "https://www.jasper.ai/favicon.ico",
            "pricing_type": "paid",
            "categories": ["Writing & Content", "Marketing & SEO"]
        },
        {
            "name": "DALL-E 3",
            "description": "OpenAI's image generation model. Create realistic images and art from text descriptions.",
            "link": "https://openai.com/dall-e-3",
            "logo_url": "https://openai.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Image Generation", "Design & UI/UX"]
        },
        {
            "name": "Runway",
            "description": "AI-powered creative suite for video editing, image generation, and motion graphics.",
            "link": "https://runwayml.com",
            "logo_url": "https://runwayml.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Video & Animation", "Image Generation"]
        },
        {
            "name": "Notion AI",
            "description": "AI-powered writing assistant integrated into Notion. Helps with notes, documents, and knowledge management.",
            "link": "https://www.notion.so/product/ai",
            "logo_url": "https://www.notion.so/front-static/favicon.ico",
            "pricing_type": "paid",
            "categories": ["Writing & Content", "Productivity"]
        },
        {
            "name": "ElevenLabs",
            "description": "Realistic text-to-speech and voice cloning AI. Create natural-sounding voiceovers in multiple languages.",
            "link": "https://elevenlabs.io",
            "logo_url": "https://elevenlabs.io/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Audio & Music"]
        },
        {
            "name": "Perplexity AI",
            "description": "AI-powered search engine that provides accurate answers with citations. Great for research.",
            "link": "https://www.perplexity.ai",
            "logo_url": "https://www.perplexity.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Research & Data", "Chatbots & Assistants"]
        },
        {
            "name": "Copy.ai",
            "description": "AI copywriting tool for marketing content. Generate ads, product descriptions, and social media posts.",
            "link": "https://www.copy.ai",
            "logo_url": "https://www.copy.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Writing & Content", "Marketing & SEO"]
        },
        {
            "name": "Synthesia",
            "description": "Create AI videos with virtual avatars. No camera or studio needed.",
            "link": "https://www.synthesia.io",
            "logo_url": "https://www.synthesia.io/favicon.ico",
            "pricing_type": "paid",
            "categories": ["Video & Animation", "Marketing & SEO"]
        },
        {
            "name": "Claude",
            "description": "Anthropic's AI assistant. Great for analysis, writing, coding, and complex reasoning tasks.",
            "link": "https://claude.ai",
            "logo_url": "https://claude.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Writing & Content", "Chatbots & Assistants", "Code & Development"]
        },
        {
            "name": "Canva AI",
            "description": "AI-powered design tools integrated into Canva. Magic Edit, Background Remover, and text-to-image.",
            "link": "https://www.canva.com/ai-image-generator/",
            "logo_url": "https://www.canva.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Design & UI/UX", "Image Generation"]
        },
        {
            "name": "Grammarly",
            "description": "AI writing assistant that checks grammar, tone, and clarity across all your writing.",
            "link": "https://www.grammarly.com",
            "logo_url": "https://www.grammarly.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Writing & Content", "Productivity"]
        },
        {
            "name": "Stable Diffusion",
            "description": "Open-source AI image generator. Run locally or use online platforms.",
            "link": "https://stability.ai/stable-diffusion",
            "logo_url": "https://stability.ai/favicon.ico",
            "pricing_type": "free",
            "categories": ["Image Generation"]
        },
        {
            "name": "Cursor",
            "description": "AI-first code editor. Built on VS Code with powerful AI coding features.",
            "link": "https://cursor.sh",
            "logo_url": "https://cursor.sh/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Code & Development"]
        },
        {
            "name": "Suno AI",
            "description": "Create music and songs from text descriptions. Generate vocals, instrumentals, and full tracks.",
            "link": "https://www.suno.ai",
            "logo_url": "https://www.suno.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Audio & Music"]
        },
        {
            "name": "Gamma",
            "description": "AI-powered presentation maker. Create beautiful slides and documents in seconds.",
            "link": "https://gamma.app",
            "logo_url": "https://gamma.app/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Productivity", "Design & UI/UX"]
        },
        {
            "name": "Microsoft Designer",
            "description": "AI-powered graphic design tool. Create social media posts, invitations, and more.",
            "link": "https://designer.microsoft.com",
            "logo_url": "https://designer.microsoft.com/favicon.ico",
            "pricing_type": "free",
            "categories": ["Design & UI/UX", "Image Generation"]
        },
        {
            "name": "Zapier AI",
            "description": "Automate workflows with AI. Connect your apps and create intelligent automation.",
            "link": "https://zapier.com/ai",
            "logo_url": "https://zapier.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Productivity", "Business & Analytics"]
        },
        {
            "name": "Framer AI",
            "description": "AI website builder. Generate and customize websites with natural language.",
            "link": "https://www.framer.com/ai",
            "logo_url": "https://www.framer.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Design & UI/UX", "Code & Development"]
        },
        {
            "name": "Pictory",
            "description": "Turn text into videos. Create short videos from blog posts and scripts automatically.",
            "link": "https://pictory.ai",
            "logo_url": "https://pictory.ai/favicon.ico",
            "pricing_type": "paid",
            "categories": ["Video & Animation", "Marketing & SEO"]
        },
        {
            "name": "Descript",
            "description": "Video and audio editing through text. Edit by editing the transcript.",
            "link": "https://www.descript.com",
            "logo_url": "https://www.descript.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Video & Animation", "Audio & Music"]
        },
        {
            "name": "Otter.ai",
            "description": "AI meeting assistant. Real-time transcription and meeting notes.",
            "link": "https://otter.ai",
            "logo_url": "https://otter.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Productivity", "Audio & Music"]
        },
        {
            "name": "Anthropic Claude",
            "description": "Advanced AI assistant for complex tasks. Strong at analysis, coding, and creative work.",
            "link": "https://www.anthropic.com/claude",
            "logo_url": "https://www.anthropic.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Chatbots & Assistants", "Code & Development", "Research & Data"]
        },
        {
            "name": "Luma AI",
            "description": "AI-powered 3D capture and generation. Create 3D models from videos.",
            "link": "https://lumalabs.ai",
            "logo_url": "https://lumalabs.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["3D & Gaming", "Video & Animation"]
        },
        {
            "name": "Replit AI",
            "description": "AI-powered collaborative coding platform. Build and deploy apps with AI assistance.",
            "link": "https://replit.com/ai",
            "logo_url": "https://replit.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Code & Development"]
        },
        {
            "name": "HubSpot AI",
            "description": "AI tools for marketing, sales, and customer service. Integrated CRM platform.",
            "link": "https://www.hubspot.com/artificial-intelligence",
            "logo_url": "https://www.hubspot.com/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Marketing & SEO", "Business & Analytics"]
        },
        {
            "name": "Beautiful.ai",
            "description": "AI presentation software. Creates professional slides with smart templates.",
            "link": "https://www.beautiful.ai",
            "logo_url": "https://www.beautiful.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Productivity", "Design & UI/UX"]
        },
        {
            "name": "Krisp",
            "description": "AI-powered noise cancellation. Remove background noise from calls and recordings.",
            "link": "https://krisp.ai",
            "logo_url": "https://krisp.ai/favicon.ico",
            "pricing_type": "freemium",
            "categories": ["Audio & Music", "Productivity"]
        }
    ]
    
    tools_created = 0
    for tool_data in tools_data:
        # Check if tool already exists
        existing = db.query(Tool).filter(Tool.name == tool_data["name"]).first()
        if existing:
            print(f"⊘ Tool already exists: {tool_data['name']}")
            continue
        
        # Get category objects
        tool_categories = [cat_dict[cat_name] for cat_name in tool_data["categories"] if cat_name in cat_dict]
        
        # Create tool
        tool = Tool(
            name=tool_data["name"],
            description=tool_data["description"],
            link=tool_data["link"],
            logo_url=tool_data["logo_url"],
            pricing_type=tool_data["pricing_type"],
            categories=tool_categories
        )
        
        db.add(tool)
        tools_created += 1
        print(f"✓ Created tool: {tool_data['name']} ({len(tool_categories)} categories)")
    
    db.commit()
    print(f"\n✓ Successfully created {tools_created} tools!")

def seed_database():
    """Main seed function"""
    print("=" * 50)
    print("Starting database seeding...")
    print("=" * 50 + "\n")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    db = SessionLocal()
    
    try:
        # Seed categories
        print("\n📂 Creating Categories...")
        print("-" * 50)
        categories = create_categories(db)
        
        # Seed tools
        print("\n🛠️  Creating Tools...")
        print("-" * 50)
        create_tools(db, categories)
        
        # Summary
        total_categories = db.query(Category).count()
        total_tools = db.query(Tool).count()
        
        print("\n" + "=" * 50)
        print("✓ Database seeding completed!")
        print("=" * 50)
        print(f"Total Categories: {total_categories}")
        print(f"Total Tools: {total_tools}")
        print("=" * 50 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()